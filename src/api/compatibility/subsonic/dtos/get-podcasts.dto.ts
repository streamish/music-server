/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicPodcastsDataDto {}

export class SubsonicPodcastsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicPodcastsDataDto })
  declare podcasts: SubsonicPodcastsDataDto;
}
