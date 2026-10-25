/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicMusicFolderDto {
  @ApiProperty({ type: String })
  declare id: string;

  @ApiProperty({ type: String })
  declare name: string;
}

export class SubsonicMusicFoldersDataDto {
  @ApiProperty({ type: SubsonicMusicFolderDto, isArray: true })
  declare musicFolder: SubsonicMusicFolderDto[];
}

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
  @ApiProperty({ type: SubsonicMusicFoldersDataDto })
  declare musicFolders: SubsonicMusicFoldersDataDto;
}
