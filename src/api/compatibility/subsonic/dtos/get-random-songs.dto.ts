/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicRandomSongsQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare size?: number;

  @IsString()
  @IsOptional()
  declare genre?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare fromYear?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare toYear?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare musicFolderId?: number;
}

export class SubsonicRandomSongsResponseDto extends SubsonicResponseDto {
  declare randomSongs: { song: SubsonicResponseObject[] };
}
