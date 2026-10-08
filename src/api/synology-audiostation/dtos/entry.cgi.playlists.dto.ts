/* eslint-disable max-classes-per-file */
import { IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { SynologyApiEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { Transform } from 'class-transformer';

class SynologyEntryPlaylistRequestDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PLAYLIST,
    expectedMethod: SynologyMethodEnum.ADD_TRACK,
  }),
  ['library'],
) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyEntryPlaylistAddAlbumBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare album: string;

  @IsString()
  declare album_artist: string;
}

export class SynologyEntryPlaylistAddArtistBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare artist: string;
}

export class SynologyEntryPlaylistAddComposerBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare composer: string;
}

export class SynologyEntryPlaylistAddGenreBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare genre: string;
}
