/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetCustomDataQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_TRACK_ID_ERROR) {}

export class UserSetCustomDataBodyDto {
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

export class UserSetCustomDataResponseDto extends SuccessResponseDto {}
