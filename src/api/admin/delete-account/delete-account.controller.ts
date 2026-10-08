import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminDeleteAccountBadRequestResponseDto,
  AdminDeleteAccountBodyDto,
  AdminDeleteAccountNotFoundResponseDto,
  AdminDeleteAccountQueryDto,
  AdminDeleteAccountResponseDto,
} from './delete-account.dto';
import { AdminDeleteAccountService } from './delete-account.service';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';

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
      [HttpStatus.BAD_REQUEST]: AdminDeleteAccountBadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: AdminDeleteAccountNotFoundResponseDto,
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
