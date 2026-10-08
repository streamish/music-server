import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { TEST_APIS } from 'src/constants/swagger';
import { TestListAccountsNotFoundResponseDto, TestListAccountsResponseDto } from './list-accounts.dto';
import { TestListAccountsService } from './list-accounts.service';

@Controller({
  path: '/api/test',
})
@ApiTags(TEST_APIS)
export class TestListAccountsController {
  constructor(private readonly testListAccountsService: TestListAccountsService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('list-accounts')
  @ApiOperation({
    summary: 'List accounts',
    description: ['Retrieves a list of all user accounts.'].join('\n'),
  })
  @ApiCreatedResponse({
    type: TestListAccountsResponseDto,
  })
  @ApiNotFoundResponse({
    type: TestListAccountsNotFoundResponseDto,
  })
  async get() {
    const accounts = await this.testListAccountsService.listAccounts();
    return {
      success: true,
      accounts,
    };
  }
}
