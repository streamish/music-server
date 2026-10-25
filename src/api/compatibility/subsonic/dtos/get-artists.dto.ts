/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicArtistsQueryDto {
  /**
   * Optionally limit artist list to a single root path
   */
  @IsInt()
  @IsOptional()
  declare musicFolderId?: number;
}

export class SubsonicArtistsResponseDto extends SubsonicResponseDto {
  declare artist: Record<string, SubsonicResponseObject[]>;
}
