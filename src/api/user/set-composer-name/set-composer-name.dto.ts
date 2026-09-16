/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class UserSetComposerNameQueryDto {
  /**
   * The ID of the composer
   */
  @IsInt({ message: ErrorCodes.INVALID_COMPOSER_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_COMPOSER_ID_ERROR })
  declare id: number;
}

export class UserSetComposerNameBodyDto {
  /**
   * Assigns a new value to the composer name.  If an empty string is provided it will erase the
   * custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_NAME_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_NAME_LENGTH_ERROR })
  declare name: string;
}

export class UserSetComposerNameResponseDto extends SuccessResponseDto {}

export class UserSetComposerNameNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.COMPOSER_NOT_FOUND_ERROR],
    enumName: 'UserSetComposerNameNotFoundErrorMessage',
    default: ErrorCodes.COMPOSER_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetComposerNameBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_COMPOSER_ID_ERROR, ErrorCodes.INVALID_NAME_ERROR, ErrorCodes.INVALID_NAME_LENGTH_ERROR],
    enumName: 'UserSetComposerNameBadRequestErrorMessage',
    default: ErrorCodes.INVALID_COMPOSER_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
