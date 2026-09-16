/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class UserSetGenreNameQueryDto {
  /**
   * The ID of the genre
   */
  @IsInt({ message: ErrorCodes.INVALID_GENRE_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_GENRE_ID_ERROR })
  declare id: number;
}

export class UserSetGenreNameBodyDto {
  /**
   * Assigns a new value to the genre name.  If an empty string is provided it will erase the
   * custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_NAME_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_NAME_LENGTH_ERROR })
  declare name: string;
}

export class UserSetGenreNameResponseDto extends SuccessResponseDto {}

export class UserSetGenreNameNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.GENRE_NOT_FOUND_ERROR],
    enumName: 'UserSetGenreNameNotFoundErrorMessage',
    default: ErrorCodes.GENRE_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetGenreNameBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.INVALID_GENRE_ID_ERROR, ErrorCodes.INVALID_NAME_ERROR, ErrorCodes.INVALID_NAME_LENGTH_ERROR],
    enumName: 'UserSetGenreNameBadRequestErrorMessage',
    default: ErrorCodes.INVALID_GENRE_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
