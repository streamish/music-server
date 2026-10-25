/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';
import { Type } from 'class-transformer';

export class SubsonicStarredQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare musicFolderId?: number;
}

export class SubsonicStarredResponseDto extends SubsonicResponseDto {
  declare starred: {
    artist?: SubsonicResponseObject[];
    album?: SubsonicResponseObject[];
    song?: SubsonicResponseObject[];
  };
}
