/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicTopSongsQueryDto {
  @IsString()
  declare artist: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare count?: number;
}

export class SubsonicTopSongsResponseDto extends SubsonicResponseDto {
  declare topSongs: { song: SubsonicResponseObject[] };
}
