import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { TEST_APIS } from 'src/constants/swagger';
import { TestCreateAccountBodyDto, TestCreateAccountResponseDto } from './create-account.dto';
import { TestCreateAccountService } from './create-account.service';

@Controller({
  path: '/api/test',
})
@ApiTags(TEST_APIS)
export class TestCreateAccountController {
  constructor(private readonly testCreateAccountService: TestCreateAccountService) {}

  @Post('create-account')
  @ApiOperation({
    summary: 'Create account',
    description: ['Creates a new account with no root paths or content'].join('\n'),
  })
  @ApiCreatedResponse({
    type: TestCreateAccountResponseDto,
  })
  async post(@Body() body: TestCreateAccountBodyDto) {
    const account = await this.testCreateAccountService.createAccount(body);
    return {
      success: true,
      account,
    };
  }
}
