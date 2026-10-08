/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsString, Length } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetArtistNameQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ARTIST_ID_ERROR) {}

export class UserSetArtistNameBodyDto {
  /**
   * Assigns a new value to the artist name.  If an empty string is provided it will erase the
   * custom value.
   */
  @IsString({ message: ErrorCodes.INVALID_NAME_ERROR })
  @Length(1, 1000, { message: ErrorCodes.INVALID_NAME_LENGTH_ERROR })
  declare name: string;
}

export class UserSetArtistNameResponseDto extends SuccessResponseDto {}
