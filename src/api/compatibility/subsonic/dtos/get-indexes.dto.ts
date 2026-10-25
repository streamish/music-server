/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicIndexesQueryDto {
  /**
   * Unix timestamp in milliseconds for the last modification time of the items.  This
   * value is currently ignored.
   */
  @IsInt()
  @IsOptional()
  ifModifiedSince?: number;

  /**
   * Optionally limit artist list to a single root path
   */
  @IsInt()
  @IsOptional()
  declare musicFolderId?: number;
}

export class SubsonicIndexesResponseDto extends SubsonicResponseDto {
  declare indexes: Record<string, SubsonicResponseObject[]>;
}
