import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicBookmarksResponseDto extends SubsonicResponseDto {
  declare bookmarks: SubsonicResponseObject;
}
