/* eslint-disable max-classes-per-file */
import { IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { Transform } from 'class-transformer';

class CoverQueryDto extends SynologyBody({
  expectedApi: SynologyApiEnum.COVER,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.GET_COVER,
}) {}

export class CoverCgiAlbumQueryDto extends CoverQueryDto {
  /**
   * The title of the album
   */
  @IsString()
  declare album_name: string;

  /**
   * The name of the album artist
   */
  @IsString()
  declare album_artist_name: string;
}

export class CoverCgiArtistQueryDto extends CoverQueryDto {
  /**
   * The name of the album artist
   */
  @IsString()
  declare artist_name: string;
}

export class CoverCgiComposerQueryDto extends CoverQueryDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer_name: string;
}

export class CoverCgiSongQueryDto extends SynologyBody({
  expectedApi: SynologyApiEnum.COVER,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.GET_SONG_COVER,
}) {
  /**
   * The ID of the song.  Synology uses a string with a prefix and the numeric ID, this software
   * only uses the numeric ID so a `music_` prefix is added for Synology, and then stripped off
   * by the `class-transformer` library.
   */
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  @IsInt()
  declare id: number;
}
