/* eslint-disable max-classes-per-file */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { SubsonicAlbumDto } from './album.dto';
import { SubsonicArtistDto } from './artist.dto';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDto } from './song.dto';
import { Type } from 'class-transformer';

export class SubsonicStarredQueryDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  declare musicFolderId?: number;
}

export class SubsonicStarredDataDto {
  @ApiPropertyOptional({ type: SubsonicArtistDto, isArray: true })
  declare artist?: SubsonicArtistDto[];

  @ApiPropertyOptional({ type: SubsonicAlbumDto, isArray: true })
  declare album?: SubsonicAlbumDto[];

  @ApiPropertyOptional({ type: SubsonicSongDto, isArray: true })
  declare song?: SubsonicSongDto[];
}

export class SubsonicStarredResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicStarredDataDto })
  declare starred: SubsonicStarredDataDto;
}
