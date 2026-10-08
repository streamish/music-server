import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Post } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserUpdatePasswordBodyDto, UserUpdatePasswordResponseDto } from './update-password.dto';
import { UserUpdatePasswordService } from './update-password.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserUpdatePasswordController {
  constructor(private readonly resetPasswordService: UserUpdatePasswordService) {}

  @ApiEndpoint(Post, 'update-password', HttpStatus.OK, {
    summary: 'Reset password',
    description: [
      `Resets the user's password to a new value and invalidates all previous sessions.`,
      'The user will need to authenticate again to continue accessing protected APIs.',
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserUpdatePasswordResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserUpdatePasswordBodyDto),
    },
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: UserUpdatePasswordBodyDto,
  ): Promise<UserUpdatePasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(user.id, body.newPassword);
    return {
      success: true,
    };
  }
}
