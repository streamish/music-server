/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString, Length, Max, Min, ValidateIf } from 'class-validator';

export class UserSetAlbumCustomDataQueryDto {
  /**
   * The ID of the album
   */
  @IsInt({ message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  declare id: number;
}

export class UserSetAlbumCustomDataBodyDto {
  /**
   * Assigns a new value to the album artists if a value is provided.  If an empty
   * string is provided it will erase the custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_ARTISTS_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR })
  declare artists: string;

  /**
   * Assigns a new value to the title of the album if a value is provided.  If an empty
   * string is provided it will erase the custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_TITLE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_TITLE_LENGTH_ERROR })
  declare title: string;

  /**
   * Assigns a new value to the year if a value is provided.  If an empty
   * string is provided it will erase the custom value.
   */
  @IsInt({ message: ErrorCodes.INVALID_YEAR_ERROR })
  @Min(1000, { message: ErrorCodes.INVALID_YEAR_ERROR })
  @Max(new Date().getFullYear() + 100, { message: ErrorCodes.INVALID_YEAR_RANGE_ERROR })
  @ValidateIf((o) => o.year !== null && o.year !== undefined && o.year !== '')
  declare year: number;
}

export class UserSetAlbumCustomDataResponseDto extends SuccessResponseDto {}

export class UserSetAlbumCustomDataNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
    enumName: 'UserSetAlbumCustomDataNotFoundErrorMessage',
    default: ErrorCodes.ALBUM_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

const UserSetAlbumCustomDataBadRequestErrorMessage = [
  ErrorCodes.INVALID_ALBUM_ID_ERROR,
  ErrorCodes.INVALID_ARTISTS_ERROR,
  ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR,
  ErrorCodes.INVALID_TITLE_ERROR,
  ErrorCodes.INVALID_TITLE_LENGTH_ERROR,
  ErrorCodes.INVALID_YEAR_ERROR,
  ErrorCodes.INVALID_YEAR_RANGE_ERROR,
];

export class UserSetAlbumCustomDataBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: UserSetAlbumCustomDataBadRequestErrorMessage,
    enumName: 'UserSetAlbumCustomDataBadRequestErrorMessage',
    default: ErrorCodes.INVALID_ALBUM_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
