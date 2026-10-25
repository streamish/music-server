import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicPodcastsResponseDto extends SubsonicResponseDto {
  declare podcasts: SubsonicResponseObject;
}
