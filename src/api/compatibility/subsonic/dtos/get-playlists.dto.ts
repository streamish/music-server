/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicPlaylistsDataDto {}

export class SubsonicPlaylistsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicPlaylistsDataDto })
  declare playlists: SubsonicPlaylistsDataDto;
}
