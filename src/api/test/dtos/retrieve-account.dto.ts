/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { TestAccountDto } from './test-account.dto';
import { createItemResponseDto } from 'src/api/response.dto';

export class RetrieveTestAccountQueryDto {
  /**
   * The username of the account
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;
}

export class RetrieveTestAccountResponseDto extends createItemResponseDto('account', TestAccountDto) {}
