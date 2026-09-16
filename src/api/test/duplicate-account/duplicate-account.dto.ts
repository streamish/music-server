/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class TestDuplicateAccountQueryDto {
  /**
   * The username for the account to copy
   */
  @IsString({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  declare username: string;
}

export class TestDuplicateAccountBodyDto {
  /**
   * The new username for the duplicated account
   */
  @IsString({ message: ErrorCodes.INVALID_NEW_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_NEW_USERNAME_LENGTH_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_NEW_USERNAME_ERROR })
  declare newUsername: string;
}

export class TestDuplicateAccountResponseDto extends SuccessResponseDto {
  /**
   * The ID of the newly created account
   */
  @IsInt()
  declare accountId: number;
}

export class TestDuplicateAccountNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR, ErrorCodes.NOT_FOUND_ERROR],
    enumName: 'TestDuplicateAccountNotFoundErrorMessage',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  declare message: ErrorCodes[];
}

export class TestDuplicateAccountBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied while serving the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_USERNAME_ERROR,
      ErrorCodes.INVALID_USERNAME_LENGTH_ERROR,
      ErrorCodes.INVALID_NEW_USERNAME_ERROR,
      ErrorCodes.INVALID_NEW_USERNAME_LENGTH_ERROR,
    ],
    enumName: 'TestDuplicateAccountBadRequestErrorMessageEnum',
  })
  declare message: ErrorCodes[];
}
