/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';
import { SubsonicSongDto } from './song.dto';

export class SubsonicNowPlayingDataDto {
  @ApiProperty({ type: SubsonicSongDto, isArray: true })
  declare entry: SubsonicSongDto[];
}

export class SubsonicNowPlayingResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicNowPlayingDataDto })
  declare nowPlaying: SubsonicNowPlayingDataDto;
}
