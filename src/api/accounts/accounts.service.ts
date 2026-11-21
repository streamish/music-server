import { AccountDto } from './dtos/list-accounts.dto';
import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
   * @param administratorId The administrator account ID to exclude
   * @returns True is there is another account with `admin` role
   */
  private async isLastAdministrator(administratorId: number) {
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
   * @param username The username of the new account
   * @param password The password of the new account
   * @param roles The user roles for the new account
   * @throws If the administrator password is incorrect
   * @throws If the username is not unique
   */
  async createAccount(username: string, password: string, roles: UserRoleEnum[]) {
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
   * @param adminAccountId The administrator performing the update
   * @param deleteAccountId The target account to delete
   * @throws If the specified account is not found
   * @throws If the operation results in no administrator accounts
   */
  async deleteAccount(adminAccountId: number, deleteAccountId: number) {
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
   * @returns Array of user accounts
   */
  async listAccounts() {
    const accounts = await this.accountEntity.findAll({
      attributes: ['id', 'username', 'roles'],
    });
    return accounts.map(accountToRow);
  }

  /**
   * Resets a user password
   * @param updateAccountId The target account to update
   * @param newPassword The new password
   * @throws If the specified account is not found
   */
  async resetUserPassword(updateAccountId: number, newPassword: string) {
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
   * @param userId The authenticated user ID
   * @param newPassword The new password
   */
  async updatePassword(userId: number, newPassword: string) {
    const passwordHash = await this.authenticationService.generatePasswordHash(newPassword);
    await this.accountEntity.update({ passwordHash }, { where: { id: userId } });
  }

  /**
   * Updates a user username
   * @param userId The authenticated user ID
   * @param newUsername The new username
   */
  async updateUsername(userId: number, newUsername: string) {
    await this.accountEntity.update({ username: newUsername }, { where: { id: userId } });
  }

  /**
   * Update the user roles.  The last administrator cannot have the `admin` role removed.
   * @param adminId The administrator performing the update
   * @param accountId The target account to update
   * @param roles The new roles for the user
   * @throws If the administrator password is incorrect
   * @throws If the specified account is not found
   */
  async updateUserRoles(adminId: number, accountId: number, roles: UserRoleEnum[]) {
    // verify user account exists
    const account = await this.accountEntity.findByPk(accountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    // verify there will still be an administrator after this change
    if (adminId === accountId) {
      const isLastAdmin = await this.isLastAdministrator(adminId);
      if (isLastAdmin) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }
    // update the account
    await this.accountEntity.update({ roles }, { where: { id: accountId } });
  }
}
