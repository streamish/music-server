/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ShoutcastGenreDto } from 'src/shoutcast/dtos/shoutcast-genre.dto';
import { createItemResponseDto } from 'src/api/response.dto';

export class CreateShoutcastGenreBodyDto {
  /**
   * The name of the SHOUTcast genre, this is not freeform text it must match
   * a genre referenced from the official SHOUTcast genre list.
   */
  @IsString({ message: ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR })
  @Length(1, 50, { message: ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR })
  declare name: string;
}

export class CreateShoutcastGenreResponseDto extends createItemResponseDto('genre', ShoutcastGenreDto) {}
