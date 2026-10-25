/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicNewestPodcastsDataDto {}

export class SubsonicNewestPodcastsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicNewestPodcastsDataDto })
  declare newestPodcasts: SubsonicNewestPodcastsDataDto;
}
