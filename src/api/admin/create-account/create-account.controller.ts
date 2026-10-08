import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminCreateAccountBodyDto, AdminCreateAccountResponseDto } from './create-account.dto';
import { AdminCreateAccountService } from './create-account.service';
import { Body, HttpStatus, Post } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';

@AdminController()
export class AdminCreateAccountController {
  constructor(private readonly createAccountService: AdminCreateAccountService) {}

  @ApiEndpoint(Post, 'create-account', HttpStatus.CREATED, {
    summary: 'Create a new account',
    description: 'Add a user account with the specified roles.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.CREATED]: AdminCreateAccountResponseDto,
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
        ...getValidationMessages(AdminCreateAccountBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: AdminCreateAccountBodyDto,
  ): Promise<AdminCreateAccountResponseDto> {
    await this.createAccountService.post(user.id, body.adminPassword, body.username, body.password, body.roles);
    return {
      success: true,
    };
  }
}
