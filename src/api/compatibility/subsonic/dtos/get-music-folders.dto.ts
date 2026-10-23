import { IsInt, IsOptional } from 'class-validator';

export class SubsonicGetMusicFolderQueryDto {
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
