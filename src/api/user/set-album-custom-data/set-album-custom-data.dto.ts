/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsInt, IsString, Length, Max, Min, ValidateIf } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetAlbumCustomDataQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {}

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
