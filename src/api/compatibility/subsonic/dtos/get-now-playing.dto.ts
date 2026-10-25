import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicNowPlayingResponseDto extends SubsonicResponseDto {
  declare nowPlaying: { entry: SubsonicResponseObject[] };
}
