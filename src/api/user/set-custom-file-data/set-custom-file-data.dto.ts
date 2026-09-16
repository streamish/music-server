/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UserSetCustomFileDataQueryDto {
  /**
   * The ID of the file
   */
  @IsInt({ message: ErrorCodes.INVALID_FILE_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_FILE_ID_ERROR })
  declare id: number;
}

export class UserSetCustomFileDataBodyDto {
  /**
   * Assigns a new value to the album artists if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_ALBUM_ARTISTS_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_ALBUM_ARTISTS_LENGTH_ERROR })
  @IsOptional()
  declare albumArtists?: string;

  /**
   * Assigns a new value to the album title if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_ALBUM_TITLE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_ALBUM_TITLE_LENGTH_ERROR })
  @IsOptional()
  declare albumTitle?: string;

  /**
   * Assigns a new value to the track artists if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_ARTISTS_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR })
  @IsOptional()
  declare artists?: string;

  /**
   * Assigns a new value to the comment if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_COMMENT_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_COMMENT_LENGTH_ERROR })
  @IsOptional()
  declare comment?: string;

  /**
   * Assigns a new value to the track composers if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_COMPOSERS_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_COMPOSERS_LENGTH_ERROR })
  @IsOptional()
  declare composers?: string;

  /**
   * Assigns a new value to the disc number if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsInt({ message: ErrorCodes.INVALID_DISC_NUMBER_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR })
  @IsOptional()
  declare discNumber?: number;

  /**
   * Assigns a new value to the genres if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_GENRES_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_GENRES_LENGTH_ERROR })
  @IsOptional()
  declare genres?: string;

  /**
   * Assigns a new value to the title if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsString({ message: ErrorCodes.INVALID_TITLE_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_TITLE_LENGTH_ERROR })
  @IsOptional()
  declare title?: string;

  /**
   * Assigns a new value to the track number if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsInt({ message: ErrorCodes.INVALID_TRACK_NUMBER_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR })
  @IsOptional()
  declare trackNumber?: number;

  /**
   * Assigns a new value to the year if a value is provided.  If an empty
   * string is provided it will erase the existing value.  If the field is not
   * provided it will leave the existing value unchanged.
   */
  @IsInt({ message: ErrorCodes.INVALID_YEAR_ERROR })
  @Min(1000, { message: ErrorCodes.INVALID_YEAR_ERROR })
  @Max(new Date().getFullYear() + 100, { message: ErrorCodes.INVALID_YEAR_RANGE_ERROR })
  @IsOptional()
  declare year?: number;
}

export class UserSetCustomFileDataResponseDto extends SuccessResponseDto {}

export class UserSetCustomFileDataNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.FILE_NOT_FOUND_ERROR],
    enumName: 'UserSetCustomFileDataNotFoundErrorMessage',
    default: ErrorCodes.FILE_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

const UserSetCustomFileDataBadRequestErrorMessage = [
  ErrorCodes.INVALID_FILE_ID_ERROR,
  ErrorCodes.INVALID_ALBUM_ARTISTS_ERROR,
  ErrorCodes.INVALID_ALBUM_ARTISTS_LENGTH_ERROR,
  ErrorCodes.INVALID_ALBUM_TITLE_ERROR,
  ErrorCodes.INVALID_ALBUM_TITLE_LENGTH_ERROR,
  ErrorCodes.INVALID_ARTISTS_ERROR,
  ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR,
  ErrorCodes.INVALID_COMMENT_ERROR,
  ErrorCodes.INVALID_COMMENT_LENGTH_ERROR,
  ErrorCodes.INVALID_COMPOSERS_ERROR,
  ErrorCodes.INVALID_COMPOSERS_LENGTH_ERROR,
  ErrorCodes.INVALID_DISC_NUMBER_ERROR,
  ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR,
  ErrorCodes.INVALID_GENRES_ERROR,
  ErrorCodes.INVALID_GENRES_LENGTH_ERROR,
  ErrorCodes.INVALID_TITLE_ERROR,
  ErrorCodes.INVALID_TITLE_LENGTH_ERROR,
  ErrorCodes.INVALID_TRACK_NUMBER_ERROR,
  ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR,
  ErrorCodes.INVALID_YEAR_ERROR,
  ErrorCodes.INVALID_YEAR_RANGE_ERROR,
];

export class UserSetCustomFileDataBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: UserSetCustomFileDataBadRequestErrorMessage,
    enumName: 'UserSetCustomFileDataBadRequestErrorMessage',
    default: ErrorCodes.INVALID_FILE_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
