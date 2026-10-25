import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicPlaylistsResponseDto extends SubsonicResponseDto {
  declare playlists: SubsonicResponseObject;
}
