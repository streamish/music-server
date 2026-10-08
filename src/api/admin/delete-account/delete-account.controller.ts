import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminDeleteAccountBodyDto,
  AdminDeleteAccountQueryDto,
  AdminDeleteAccountResponseDto,
} from './delete-account.dto';
import { AdminDeleteAccountService } from './delete-account.service';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';

@AdminController()
export class AdminDeleteAccountController {
  constructor(private readonly deleteAccountService: AdminDeleteAccountService) {}

  @ApiEndpoint(Patch, 'delete-account', HttpStatus.OK, {
    summary: 'Delete an account',
    description:
      'Deletes the specified account. If it is the only admin account a new one account must be created first.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminDeleteAccountResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR,
        ...getValidationMessages(AdminDeleteAccountQueryDto),
        ...getValidationMessages(AdminDeleteAccountBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async delete(
    @User() user: AccountEntity,
    @Query() query: AdminDeleteAccountQueryDto,
    @Body() body: AdminDeleteAccountBodyDto,
  ): Promise<AdminDeleteAccountResponseDto> {
    await this.deleteAccountService.deleteAccount(user.id, body.adminPassword, query.id);
    return {
      success: true,
    };
  }
}
