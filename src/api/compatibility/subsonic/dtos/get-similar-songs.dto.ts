/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicSimilarSongsQueryDto {
  @IsString()
  declare id: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;
}

export class SubsonicSimilarSongsResponseDto extends SubsonicResponseDto {
  declare similarSongs: { song: SubsonicResponseObject[] };
}
