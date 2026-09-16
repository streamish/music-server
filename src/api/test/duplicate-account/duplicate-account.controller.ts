import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Query } from '@nestjs/common';
import { InternalServerErrorResponseDto } from 'src/api/response.dto';
import { TEST_APIS } from 'src/constants/swagger';
import {
  TestDuplicateAccountBadRequestResponseDto,
  TestDuplicateAccountBodyDto,
  TestDuplicateAccountNotFoundResponseDto,
  TestDuplicateAccountQueryDto,
  TestDuplicateAccountResponseDto,
} from './duplicate-account.dto';
import { TestDuplicateAccountService } from './duplicate-account.service';

@Controller({
  path: '/api/test',
})
@ApiTags(TEST_APIS)
export class TestDuplicateAccountController {
  constructor(private readonly duplicateAccountService: TestDuplicateAccountService) {}

  @Post('duplicate-account')
  @ApiOperation({
    summary: 'Duplicate account',
    description: [
      'Duplicates an existing user account with a new username.',
      'All files associated with the original account will be copied to the new account.',
      'The new account will be re-indexed after duplication.',
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: TestDuplicateAccountResponseDto,
  })
  @ApiBadRequestResponse({
    type: TestDuplicateAccountBadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    type: TestDuplicateAccountNotFoundResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponseDto,
  })
  async post(@Query() query: TestDuplicateAccountQueryDto, @Body() body: TestDuplicateAccountBodyDto) {
    const newAccount = await this.duplicateAccountService.duplicateAccount(query.username, body.newUsername);
    return {
      success: true,
      accountId: newAccount.id,
    };
  }
}
