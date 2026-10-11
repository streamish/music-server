import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/api/response.dto';
import { TestAccountDto } from './test-account.dto';

export class ListTestAccountsResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: [TestAccountDto] })
  declare accounts: TestAccountDto[];
}
