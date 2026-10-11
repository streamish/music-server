import { ApiEndpoint } from '../api.decorator';
import { ApiTestService } from './test.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CreateTestAccountBodyDto, CreateTestAccountResponseDto } from './dtos';
import { DeleteAccountQueryDto } from '../accounts/dtos';
import { DeleteTestAccountQueryDto } from './dtos/delete-test-account.dto';
import {
  DuplicateTestAccountBodyDto,
  DuplicateTestAccountQueryDto,
  DuplicateTestAccountResponseDto,
} from './dtos/duplicate-account.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { ListTestAccountsResponseDto } from './dtos/list-accounts.dto';
import { RetrieveTestAccountQueryDto, RetrieveTestAccountResponseDto } from './dtos/retrieve-account.dto';
import { SuccessResponseDto, getValidationMessages } from '../response.dto';

@Controller('/api/test')
export class ApiTestController {
  constructor(private readonly testService: ApiTestService) {}

  /**
   * `POST` reuqest to `/api/test/create-test-account`
   */
  @ApiEndpoint(Post, 'create-test-account', HttpStatus.OK, {
    summary: 'Create an empty account for testing',
    description: [
      'Creates a new account with no root paths or content',
      'This endpoint only exists when the `NODE_ENV` is `test`.',
    ].join(' '),
    isTest: true,
    responses: {
      [HttpStatus.OK]: CreateTestAccountResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(CreateTestAccountBodyDto),
    },
  })
  async createTestAccount(@Body() body: CreateTestAccountBodyDto) {
    const account = await this.testService.createTestAccount(body);
    return {
      success: true,
      account,
    };
  }

  /**
   * `DELETE` request to /api/test/delete-test-account`
   */
  @ApiEndpoint(Delete, 'delete-test-account', HttpStatus.OK, {
    summary: 'Delete test account',
    description: [
      'Deletes a test user account.',
      'All files associated with the account will be removed.',
      'The account will be permanently deleted.',
    ].join(' '),
    isTest: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.BAD_REQUEST]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR, ...getValidationMessages(DeleteAccountQueryDto)],
    },
  })
  async deleeteTestAccount(@Query() query: DeleteTestAccountQueryDto) {
    await this.testService.deleteTestAccount(query.id);
    return {
      success: true,
    };
  }

  /**
   * `POST` request to `/api/test/duplicate-test-account`
   */
  @ApiEndpoint(Post, 'duplicate-test-account', HttpStatus.CREATED, {
    summary: 'Duplicate account',
    description: [
      'Duplicates an existing user account with a new username.',
      'All files associated with the original account will be copied to the new account.',
      'The new account will be re-indexed after duplication.',
    ].join(' '),
    isTest: true,
    responses: {
      [HttpStatus.CREATED]: DuplicateTestAccountResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
        ...getValidationMessages(DuplicateTestAccountQueryDto),
        ...getValidationMessages(DuplicateTestAccountBodyDto),
      ],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async duplicateTestAccount(@Query() query: DuplicateTestAccountQueryDto, @Body() body: DuplicateTestAccountBodyDto) {
    const account = await this.testService.duplicateTestAccount(query.username, body.newUsername);
    return {
      success: true,
      account,
    };
  }

  /**
   * `GET` requests to `/api/test/list-test-accounts`
   */
  @ApiEndpoint(Get, 'list-test-accounts', HttpStatus.OK, {
    summary: 'List accounts',
    description: 'Retrieves a list of all user accounts.',
    isTest: true,
    responses: {
      [HttpStatus.OK]: ListTestAccountsResponseDto,
    },
  })
  async listTestAccounts() {
    const accounts = await this.testService.listAccounts();
    return {
      success: true,
      accounts,
    };
  }

  /**
   * `GET` request to `/api/test/retrieve-test-account`
   */
  @ApiEndpoint(Get, 'retrieve-test-account', HttpStatus.OK, {
    summary: 'Delete account',
    description: [
      'Deletes an existing user account.',
      'All files associated with the account will be removed.',
      'The account will be permanently deleted.',
    ].join(' '),
    isTest: true,
    responses: {
      [HttpStatus.OK]: RetrieveTestAccountResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [...getValidationMessages(RetrieveTestAccountQueryDto)],
    },
  })
  async get(@Query() query: RetrieveTestAccountQueryDto) {
    const account = await this.testService.retrieveTestAccount(query.username);
    return {
      success: true,
      account,
    };
  }
}
