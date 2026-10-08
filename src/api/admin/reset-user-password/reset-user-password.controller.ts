import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminResetUserPasswordBodyDto,
  AdminResetUserPasswordQueryDto,
  AdminResetUserPasswordResponseDto,
} from './reset-user-password.dto';
import { AdminResetUserPasswordService } from './reset-user-password.service';
import { Body, HttpStatus, Post, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';

@AdminController()
export class AdminResetUserPasswordController {
  constructor(private readonly resetPasswordService: AdminResetUserPasswordService) {}

  @ApiEndpoint(Post, 'reset-user-password', HttpStatus.OK, {
    summary: 'Reset user password',
    description: 'Resets the password for a specified user account and invalidates their prior sessions.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminResetUserPasswordResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(AdminResetUserPasswordQueryDto),
        ...getValidationMessages(AdminResetUserPasswordBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async post(
    @User() user: AccountEntity,
    @Query() query: AdminResetUserPasswordQueryDto,
    @Body() body: AdminResetUserPasswordBodyDto,
  ): Promise<AdminResetUserPasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(user.id, body.adminPassword, query.id, body.newPassword);
    return {
      success: true,
    };
  }
}
