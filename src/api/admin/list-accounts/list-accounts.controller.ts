import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminListAccountsResponseDto } from './list-accounts.dto';
import { AdminListAccountsService } from './list-accounts.service';
import { Get, HttpStatus } from '@nestjs/common';

@AdminController()
export class AdminListAccountsController {
  constructor(private readonly listAccountsService: AdminListAccountsService) {}

  @ApiEndpoint(Get, 'list-accounts', HttpStatus.OK, {
    summary: 'List all accounts',
    description: 'Retrieves a list of all accounts in the system.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminListAccountsResponseDto,
    },
  })
  async get(): Promise<AdminListAccountsResponseDto> {
    const accounts = await this.listAccountsService.listAccounts();
    return { accounts, success: true };
  }
}
