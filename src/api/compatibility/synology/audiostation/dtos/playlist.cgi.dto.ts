/* eslint-disable max-classes-per-file */
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody, SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologySongDto } from './song.cgi.dto';
import { SynologySuccessResponseDto } from '../synology.response.dto';
import { Transform, plainToInstance } from 'class-transformer';

export class SynologyPlaylistRetrieveBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.GET_INFO,
}) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyPlaylistListBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.LIST,
}) {}

export class SynologyPlaylistCreateNormalBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.CREATE,
}) {
  /**
   * The name of the playlist to create.
   */
  @IsString()
  declare name: string;
}

class SynologySmartListRule {
  @IsInt()
  declare interval: number;

  declare op: number;

  @IsInt()
  declare tag: number;

  @IsString()
  declare tagval: string;

  get intervalName(): SmartPlaylistIntervalTagEnum | undefined {
    switch (this.interval) {
      case 1:
        return SmartPlaylistIntervalTagEnum.DAYS;
      case 2:
        return SmartPlaylistIntervalTagEnum.WEEKS;
      case 3:
        return SmartPlaylistIntervalTagEnum.MONTHS;
      default:
        return undefined;
    }
  }

  get operationName(): SmartPlaylistOperationEnum | undefined {
    switch (this.op) {
      case 1:
        return SmartPlaylistOperationEnum.IS;
      case 2:
        return SmartPlaylistOperationEnum.IS_NOT;
      case 3:
        return SmartPlaylistOperationEnum.CONTAINS;
      case 4:
        return SmartPlaylistOperationEnum.DOES_NOT_CONTAIN;
      case 5:
        return SmartPlaylistOperationEnum.LESS_THAN;
      case 6:
        return SmartPlaylistOperationEnum.GREATER_THAN_OR_EQUAL_TO;
      case 7:
        return SmartPlaylistOperationEnum.IN_THE_LAST;
      case 8:
        return SmartPlaylistOperationEnum.NOT_IN_THE_LAST;
      case 9:
        return SmartPlaylistOperationEnum.AFTER;
      case 10:
        return SmartPlaylistOperationEnum.BEFORE;
      default:
        return undefined;
    }
  }

  get fieldName(): SmartPlaylistFieldEnum | undefined {
    switch (this.tag) {
      case 1:
        return SmartPlaylistFieldEnum.ARTIST;
      case 2:
        return SmartPlaylistFieldEnum.ALBUM;
      case 11:
        return SmartPlaylistFieldEnum.ALBUM_ARTIST;
      case 12:
        return SmartPlaylistFieldEnum.COMPOSER;
      case 3:
        return SmartPlaylistFieldEnum.GENRE;
      case 4:
        return SmartPlaylistFieldEnum.FILE_PATH;
      case 7:
        return SmartPlaylistFieldEnum.YEAR;
      case 9:
        return SmartPlaylistFieldEnum.BIT_RATE;
      case 10:
        return SmartPlaylistFieldEnum.DATE_ADDED;
      case 13:
        return SmartPlaylistFieldEnum.RATING;
      default:
        return undefined;
    }
  }
}

export class SynologyPlaylistCreateSmartBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.CREATE_SMART,
}) {
  @ApiProperty({
    enum: SmartPlaylistConjugalEnum,
    enumName: 'SmartPlaylistConjugalEnum',
    example: SmartPlaylistConjugalEnum.AND,
  })
  @IsEnum(SmartPlaylistConjugalEnum)
  declare conj_rule: SmartPlaylistConjugalEnum;

  /**
   * The name of the playlist to create.
   */
  @IsString()
  declare name: string;

  @ApiProperty({
    type: SynologySmartListRule,
    isArray: true,
  })
  @Transform(({ value }) => JSON.parse(value).map((rule) => plainToInstance(SynologySmartListRule, rule)))
  declare rules_json: SynologySmartListRule[];
}

export class SynologyPlaylistUpdateSmartBodyDto extends IntersectionType(
  PickType(SynologyPlaylistCreateSmartBodyDto, ['conj_rule', 'name', 'rules_json']),
  SynologyBody({
    expectedApi: SynologyApiEnum.PLAYLIST,
    expectedMethod: SynologyMethodEnum.UPDATE_SMART,
  }),
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

export class SynologyPlaylistRenameBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.RENAME,
}) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * The name of the playlist to create.
   */
  @IsString()
  declare new_name: string;
}

export class SynologyPlaylistDeleteBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.DELETE,
}) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  @Transform(({ obj }) => {
    const type = obj.id.split('/')[0].split('_')[2];
    switch (type) {
      case 'normal':
        return PlaylistTypeEnum.NORMAL;
      case 'smart':
        return PlaylistTypeEnum.SMART;
      default:
        return undefined;
    }
  })
  declare type: PlaylistTypeEnum;
}

export class SynologyPlaylistAddOrRemoveItemBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.UPDATE_SONGS,
}) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * The number of items to remove.
   */
  declare limit: number;

  /**
   * The position of the item(s) in the playlist, if `-1` then it is a new item otherwise
   * the list-index for the item.
   */
  declare offset: number;

  /**
   * The ID of the song comes in a `music_<id>,music_<id>` format or for radio stations it
   * can be `radio_<title>_<url>` or when deleting, an empty value.
   *
   * eg adding song(s): `music_1234,music_5678`
   * eg adding radio(s) `radio_The Best Radio Station Ever https://example.com/stream`
   * eg adding both: `music_1234,music_5678,radio_The Best Radio Station Ever https://example.com/stream`
   *
   * The posted value is transformed to an array of song IDs as numbers or radio station IDs
   * as strings.
   */
  @IsInt()
  @Transform(({ value }) =>
    value.split(',').map((v) => {
      if (v.startsWith('music_')) {
        return Number.parseInt(v.split('_').pop(), 10);
      }
      return v;
    }),
  )
  declare songs: (number | string)[];
}

export class SynologyPlaylistMoveItemsBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.UPDATE_SONGS,
}) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;

  /**
   * The number of items being moved
   */
  @IsInt()
  declare limit: number;

  /**
   * The position of the item(s) in the playlist, if `-1` then it is a new item otherwise
   * the list-index for the item.
   */
  @IsInt()
  declare offset: number;

  /**
   * The ID of the song comes in a `music_<id>,music_<id>` format, eg `music_1234,music_5678`
   * or when deleting, an empty value.
   */
  @IsInt()
  @Transform(({ value }) => value.split(',').map((v) => Number.parseInt(v.split('_').pop(), 10)))
  declare songs: number[];
}

export class SynologyPlaylistRemoveMissingBodyDto extends SynologyBody({
  expectedApi: SynologyApiEnum.PLAYLIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
  expectedMethod: SynologyMethodEnum.REMOVE_MISSING,
}) {
  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyPlaylistTrackListBodyDto extends OmitType(
  SynologyBodyWithPagination({
    expectedApi: SynologyApiEnum.PLAYLIST,
    expectedLibrary: SynologyLibraryEnum.ALL,
    expectedMethod: SynologyMethodEnum.LIST,
  }),
  ['api', 'version', 'library'] as const,
) {
  /**
   * Additional data to include in the response.  This field is ignored by the backend for now
   * and a fixed-payload response is returned.
   */
  @IsString()
  declare additional: string;

  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyPlaylistIdDataDto {
  @IsString()
  declare id: string;
}

export class SynologyPlaylistIdResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyPlaylistIdDataDto,
  })
  declare data: SynologyPlaylistIdDataDto;
}

class SynologyPlaylistSharingInfoDto {
  @IsNumber()
  declare date_available: number;

  @IsNumber()
  declare date_expired: number;

  @IsString()
  declare id: string;

  @IsString()
  declare url: string;

  @IsString()
  declare status: string;
}

export class SynologyPlaylistRuleDto {
  @IsNumber()
  declare interval: number;

  @IsNumber()
  declare op: number;

  @IsNumber()
  declare tag: number;

  @IsString()
  declare tagval: string;
}

class SynologyPlaylistAdditionalDto {
  @ApiProperty({
    enum: SmartPlaylistConjugalEnum,
    enumName: 'SmartPlaylistConjugalEnum',
    example: SmartPlaylistConjugalEnum.AND,
  })
  @IsEnum(SmartPlaylistConjugalEnum)
  rules_conjunction?: SmartPlaylistConjugalEnum;

  @ApiProperty({
    type: SynologyPlaylistRuleDto,
    isArray: true,
  })
  rules?: SynologyPlaylistRuleDto[];

  @ApiProperty({
    type: SynologyPlaylistSharingInfoDto,
  })
  declare sharing_info: SynologyPlaylistSharingInfoDto;
}

class SynologyPlaylistDto {
  @IsString()
  declare id: string;

  @IsString()
  declare library: string;

  @IsString()
  declare name: string;

  @IsString()
  declare sharing_status: string;

  @ApiProperty({
    enum: PlaylistTypeEnum,
    enumName: 'PlaylistTypeEnum',
    example: PlaylistTypeEnum.NORMAL,
  })
  @IsEnum(PlaylistTypeEnum)
  declare type: PlaylistTypeEnum;

  @ApiProperty({
    type: SynologyPlaylistAdditionalDto,
  })
  declare additional: SynologyPlaylistAdditionalDto;
}

export class SynologyPlaylistDataDto {
  @IsNumber()
  declare offset: number;

  @IsNumber()
  declare total: number;

  @ApiProperty({
    type: SynologyPlaylistDto,
    isArray: true,
  })
  declare playlists: SynologyPlaylistDto[];
}

export class SynologyPlaylistResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyPlaylistDataDto,
  })
  declare data: SynologyPlaylistDataDto;
}

export class SynologyPlaylistSongDto extends SynologySongDto {
  @IsInt()
  declare position: number;
}

export class SynologyPlaylistAdditionalWithItemsDto extends SynologyPlaylistAdditionalDto {
  @ApiProperty({
    type: SynologyPlaylistSongDto,
    isArray: true,
  })
  declare songs: SynologyPlaylistSongDto[];

  declare songs_offset: number;

  declare songs_total: number;
}

export class SynologyPlaylistWithItemsDto extends SynologyPlaylistDto {
  @ApiProperty({
    type: SynologyPlaylistAdditionalWithItemsDto,
  })
  declare additional: SynologyPlaylistAdditionalWithItemsDto;
}

export class SynologyPlaylistWithItemsDataDto {
  @ApiProperty({
    type: SynologyPlaylistWithItemsDto,
    isArray: true,
  })
  declare playlists: SynologyPlaylistWithItemsDto[];
}

export class SynologyPlaylistWithItemsResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyPlaylistWithItemsDataDto,
  })
  declare data: SynologyPlaylistWithItemsDataDto;
}
