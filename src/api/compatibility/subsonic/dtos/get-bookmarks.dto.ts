/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicBookmarksDataDto {}

export class SubsonicBookmarksResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicBookmarksDataDto })
  declare bookmarks: SubsonicBookmarksDataDto;
}
