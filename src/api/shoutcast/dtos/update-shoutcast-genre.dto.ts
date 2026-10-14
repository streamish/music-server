/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ShoutcastGenreDto } from 'src/shoutcast/dtos/shoutcast-genre.dto';
import { createItemResponseDto } from 'src/api/response.dto';

export class UpdateShoutcastGenreQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_SHOUTCAST_GENRE_ID_ERROR) {}

export class UpdateShoutcastGenreBodyDto {
  @IsString({ message: ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR })
  @Length(1, 50, { message: ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR })
  declare name: string;
}

export class UpdateShoutcastGenreResponseDto extends createItemResponseDto('genre', ShoutcastGenreDto) {}
