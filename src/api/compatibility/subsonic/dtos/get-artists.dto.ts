import { IsInt, IsOptional } from 'class-validator';

export class SubsonicArtistsQueryDto {
  /**
   * Optionally limit artist list to a single root path
   */
  @IsInt()
  @IsOptional()
  declare musicFolderId?: number;
}
