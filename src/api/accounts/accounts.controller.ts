import { AccountEntity } from 'src/database/entities';
import { AdminAuthorizationBodyDto } from '../request.dto';
import { ApiAccountsService } from './accounts.service';
import { ApiEndpoint } from '../api.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import {
  CreateAccountBodyDto,
  DeleteAccountQueryDto,
  ListAccountsResponseDto,
  ResetUserPasswordBodyDto,
  ResetUserPasswordQueryDto,
  UpdatePasswordBodyDto,
  UpdateUserRolesBodyDto,
  UpdateUserRolesQueryDto,
} from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiAccountsController {
  constructor(private readonly accountsService: ApiAccountsService) {}

  @ApiEndpoint(Post, 'create-account', HttpStatus.CREATED, {
    summary: 'Create a new account',
    description: 'Add a user account with the specified roles.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.CREATED]: SuccessResponseDto,
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
        ...getValidationMessages(CreateAccountBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@User() user: AccountEntity, @Body() body: CreateAccountBodyDto) {
    await this.accountsService.createAccount(user.id, body.adminPassword, body.username, body.password, body.roles);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Patch, 'delete-account', HttpStatus.OK, {
    summary: 'Delete an account',
    description:
      'Deletes the specified account. If it is the only admin account a new one account must be created first.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR,
        ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR,
        ...getValidationMessages(DeleteAccountQueryDto),
        ...getValidationMessages(AdminAuthorizationBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async deleteAccount(
    @User() user: AccountEntity,
    @Query() query: DeleteAccountQueryDto,
    @Body() body: AdminAuthorizationBodyDto,
  ) {
    await this.accountsService.deleteAccount(user.id, body.adminPassword, query.id);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Get, 'list-accounts', HttpStatus.OK, {
    summary: 'List all accounts',
    description: 'Retrieves a list of all accounts in the system.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: ListAccountsResponseDto,
    },
  })
  async getAccounts() {
    const accounts = await this.accountsService.listAccounts();
    return { accounts, success: true };
  }

  @ApiEndpoint(Post, 'reset-user-password', HttpStatus.OK, {
    summary: 'Reset user password',
    description: 'Resets the password for a specified user account and invalidates their prior sessions.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(ResetUserPasswordQueryDto),
        ...getValidationMessages(ResetUserPasswordBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async resetUserPassword(
    @User() user: AccountEntity,
    @Query() query: ResetUserPasswordQueryDto,
    @Body() body: ResetUserPasswordBodyDto,
  ) {
    await this.accountsService.resetUserPassword(user.id, body.adminPassword, query.id, body.newPassword);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Post, 'update-password', HttpStatus.OK, {
    summary: 'Reset password',
    description: [
      `Resets the user's password to a new value and invalidates all previous sessions.`,
      'The user will need to authenticate again to continue accessing protected APIs.',
    ].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UpdatePasswordBodyDto),
    },
  })
  async post(@User() user: AccountEntity, @Body() body: UpdatePasswordBodyDto) {
    await this.accountsService.updatePassword(user.id, body.newPassword);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Patch, 'update-user-roles', HttpStatus.OK, {
    summary: 'Update user roles',
    description: 'Updates the roles of a specified user account.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR,
        ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR,
        ...getValidationMessages(UpdateUserRolesQueryDto),
        ...getValidationMessages(UpdateUserRolesBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async updateUserRoles(
    @User() user: AccountEntity,
    @Query() query: UpdateUserRolesQueryDto,
    @Body() body: UpdateUserRolesBodyDto,
  ) {
    await this.accountsService.updateUserRoles(user.id, body.adminPassword, query.id, body.roles);
    return {
      success: true,
    };
  }
}
