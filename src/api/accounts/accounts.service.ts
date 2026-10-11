import { AccountDto } from './dtos/list-accounts.dto';
import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UserRoleEnum } from 'src/types/enums';

function accountToRow(user: AccountEntity): AccountDto {
  return {
    id: user.id,
    username: user.username,
    roles: user.roles,
  };
}

@Injectable()
export class ApiAccountsService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    private readonly authenticationService: AuthenticationService,
  ) {}

  /**
   * Confirms there is still an account with the `admin` role if the provided administrator is
   * excluded because of deletion or role-revocation.
   * @param {number} administratorId The administrator account ID to exclude
   * @returns {Promise<boolean>} True is there is another account with `admin` role
   */
  private async isLastAdministrator(administratorId: number): Promise<boolean> {
    const userList = await this.accountEntity.findAll({
      attributes: ['id', 'roles'],
      where: {
        id: {
          [Op.not]: administratorId,
        },
      },
    });
    const adminCount = userList.filter((user) => user.roles.indexOf(UserRoleEnum.ADMIN) > -1).length;
    return adminCount === 0;
  }

  /**
   * Creates a user account
   * @param {number} adminAccountId The administrator performing the update
   * @param {string} adminPassword The administrator's password to authorize the creation
   * @param {string} username The username of the new account
   * @param {string} password The password of the new account
   * @param {UserRoleEnum[]} roles The user roles for the new account
   */
  async createAccount(
    adminAccountId: number,
    adminPassword: string,
    username: string,
    password: string,
    roles: UserRoleEnum[],
  ): Promise<void> {
    // verify administrator password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    }
    // verify username is unique
    const exists = await this.accountEntity.findOne({
      attributes: ['id'],
      where: {
        username,
      },
    });
    if (exists?.id) {
      throw new BadRequestException(ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR);
    }
    // create account
    const passwordHash = await this.authenticationService.generatePasswordHash(password);
    await this.accountEntity.create({
      username,
      passwordHash,
      roles,
      sessionKey: Guid.create(),
    } as AccountEntity);
  }

  /**
   * Deletes a user account
   * @param {number} adminAccountId The administrator performing the update
   * @param {string} adminPassword The administrator's password to authorize the deletion
   * @param {number} deleteAccountId The target account to delete
   */
  async deleteAccount(adminAccountId: number, adminPassword: string, deleteAccountId: number): Promise<void> {
    // verify own password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    }
    // Prevent an admin from deleting their own account if there is no other administrator
    if (adminAccountId === deleteAccountId) {
      const isLastAdmin = await this.isLastAdministrator(adminAccountId);
      if (isLastAdmin) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }
    // delete the account
    const account = await this.accountEntity.findByPk(deleteAccountId, { attributes: ['id'] });
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    await account.destroy();
  }

  /**
   * Lists user accounts.
   * @returns {Promise<AccountDto[]>} Array of user accounts
   */
  async listAccounts(): Promise<AccountDto[]> {
    const accounts = await this.accountEntity.findAll({
      attributes: ['id', 'username', 'roles'],
    });
    return accounts.map(accountToRow);
  }

  /**
   * Resets a user password
   * @param {number} adminAccountId The administrator performing the update
   * @param {string} adminPassword The administrator's password to authorize the update
   * @param {number} updateAccountId The target account to update
   * @param {string} newPassword The new password
   */
  async resetUserPassword(
    adminAccountId: number,
    adminPassword: string,
    updateAccountId: number,
    newPassword: string,
  ): Promise<void> {
    // verify administrator password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    }
    // verify user account exists
    const userAccount = await this.accountEntity.findByPk(updateAccountId);
    if (!userAccount) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    // apply new password
    await this.updatePassword(updateAccountId, newPassword);
  }

  /**
   * Updates a user password
   * @param {number} accountId The account to update
   * @param {string} newPassword The new password
   */
  async updatePassword(accountId: number, newPassword: string): Promise<void> {
    const passwordHash = await this.authenticationService.generatePasswordHash(newPassword);
    await this.accountEntity.update({ passwordHash }, { where: { id: accountId } });
  }

  /**
   * Update the user roles.  The last administrator cannot have the `admin` role removed.
   * @param {number} adminAccountId The administrator performing the update
   * @param {string} adminPassword The administrator's password to authorize the update
   * @param {number} updateAccountId The target account to update
   * @param {UserRoleEnum[]} roles The new roles for the user
   */
  async updateUserRoles(
    adminAccountId: number,
    adminPassword: string,
    updateAccountId: number,
    roles: UserRoleEnum[],
  ): Promise<void> {
    // verify administrator password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    }
    // verify user account exists
    const account = await this.accountEntity.findByPk(updateAccountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    // verify there will still be an administrator after this change
    if (adminAccountId === updateAccountId) {
      const isLastAdmin = await this.isLastAdministrator(adminAccountId);
      if (isLastAdmin) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }
    // update the account
    await this.accountEntity.update({ roles }, { where: { id: updateAccountId } });
  }
}
