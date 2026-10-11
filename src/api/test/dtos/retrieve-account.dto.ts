/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';
import { TestAccountDto } from './test-account.dto';

export class RetrieveTestAccountQueryDto {
  /**
   * The username of the account
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;
}

export class RetrieveTestAccountResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: TestAccountDto })
  declare account: TestAccountDto;
}
