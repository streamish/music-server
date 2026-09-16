import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Delete, Query } from '@nestjs/common';
import { InternalServerErrorResponseDto } from 'src/api/response.dto';
import {
  TestDeleteAccountNotFoundResponseDto,
  TestDeleteAccountQueryDto,
  TestDeleteAccountResponseDto,
} from './delete-account.dto';
import { TestDeleteAccountService } from './delete-account.service';

@Controller({
  path: '/api/test',
})
@ApiTags()
export class TestDeleteAccountController {
  constructor(private readonly deleteAccountService: TestDeleteAccountService) {}

  // eslint-disable-next-line class-methods-use-this
  @Delete('delete-account')
  @ApiOperation({
    summary: 'Delete account',
    description: [
      'Deletes an existing user account.',
      'All files associated with the account will be removed.',
      'The account will be permanently deleted.',
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: TestDeleteAccountResponseDto,
  })
  @ApiNotFoundResponse({
    type: TestDeleteAccountNotFoundResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponseDto,
  })
  async delete(@Query() query: TestDeleteAccountQueryDto) {
    await this.deleteAccountService.deleteAccount(query.id);
    return {
      success: true,
    };
  }
}
