import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { InternalServerErrorResponseDto } from 'src/api/response.dto';
import { TEST_APIS } from 'src/constants/swagger';
import {
  TestRetrieveAccountNotFoundResponseDto,
  TestRetrieveAccountQueryDto,
  TestRetrieveAccountResponseDto,
} from './retrieve-account.dto';
import { TestRetrieveAccountService } from './retrieve-account.service';

@Controller({
  path: '/api/test',
})
@ApiTags(TEST_APIS)
export class TestRetrieveAccountController {
  constructor(private readonly testRetrieveAccountService: TestRetrieveAccountService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('retrieve-account')
  @ApiOperation({
    summary: 'Delete account',
    description: [
      'Deletes an existing user account.',
      'All files associated with the account will be removed.',
      'The account will be permanently deleted.',
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: TestRetrieveAccountResponseDto,
  })
  @ApiNotFoundResponse({
    type: TestRetrieveAccountNotFoundResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponseDto,
  })
  async get(@Query() query: TestRetrieveAccountQueryDto) {
    const account = await this.testRetrieveAccountService.retrieveAccount(query.username);
    return {
      success: true,
      account,
    };
  }
}
