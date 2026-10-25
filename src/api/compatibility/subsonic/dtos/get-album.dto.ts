/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { SubsonicAlbumDto } from './album.dto';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDto } from './song.dto';
import { Type } from 'class-transformer';

class SubsonicAlbumWithTracksDto extends SubsonicAlbumDto {
  @ApiProperty({ type: [SubsonicSongDto], required: true })
  declare song: SubsonicSongDto[];
}

export class SubsonicAlbumQueryDto {
  @IsInt()
  @Type(() => Number)
  declare id: number;
}

export class SubsonicAlbumResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicAlbumWithTracksDto })
  declare album: SubsonicAlbumWithTracksDto;
}
