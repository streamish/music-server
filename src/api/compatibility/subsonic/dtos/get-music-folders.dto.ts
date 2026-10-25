/* eslint-disable max-classes-per-file */
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicMusicFolderQueryDto {
  /**
   * Unix timestamp in milliseconds for the last modification time of the items.  This
   * value is currently ignored.
   */
  @IsInt()
  @IsOptional()
  ifModifiedSince?: number;

  /**
   * The root path of the folders
   */
  @IsInt()
  declare musicFolderId?: number;
}

export class SubsonicMusicFoldersResponseDto extends SubsonicResponseDto {
  declare musicFolders: { musicFolder: { id: string; name: string }[] };
}
