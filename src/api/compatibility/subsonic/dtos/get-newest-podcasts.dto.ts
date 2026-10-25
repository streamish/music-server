import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicNewestPodcastsResponseDto extends SubsonicResponseDto {
  declare newestPodcasts: SubsonicResponseObject;
}
