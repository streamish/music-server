import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminResetUserPasswordBadRequestResponseDto,
  AdminResetUserPasswordBodyDto,
  AdminResetUserPasswordNotFoundResponseDto,
  AdminResetUserPasswordQueryDto,
  AdminResetUserPasswordResponseDto,
} from './reset-user-password.dto';
import { AdminResetUserPasswordService } from './reset-user-password.service';
import { Body, HttpStatus, Post, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';

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
      [HttpStatus.BAD_REQUEST]: AdminResetUserPasswordBadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: AdminResetUserPasswordNotFoundResponseDto,
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
