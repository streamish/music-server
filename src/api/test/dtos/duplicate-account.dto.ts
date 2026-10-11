/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { TestAccountDto } from './test-account.dto';
import { createItemResponseDto } from 'src/api/response.dto';

export class DuplicateTestAccountQueryDto {
  /**
   * The username for the account to copy
   */
  @IsString({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;
}

export class DuplicateTestAccountBodyDto {
  /**
   * The new username for the duplicated account
   */
  @IsString({ message: ErrorCodes.INVALID_NEW_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_NEW_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_NEW_USERNAME_ERROR })
  declare newUsername: string;
}

export class DuplicateTestAccountResponseDto extends createItemResponseDto('account', TestAccountDto) {}
