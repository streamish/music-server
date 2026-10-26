import {
  ContentTypeEnum,
  FileTypeEnum,
  PlaylistTypeEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { PlaylistsService } from 'src/playlists/playlists.service';
import {
  SynologyPlaylistAddOrRemoveItemBodyDto,
  SynologyPlaylistCreateNormalBodyDto,
  SynologyPlaylistCreateSmartBodyDto,
  SynologyPlaylistDataDto,
  SynologyPlaylistDeleteBodyDto,
  SynologyPlaylistRenameBodyDto,
  SynologyPlaylistRetrieveBodyDto,
  SynologyPlaylistRuleDto,
  SynologyPlaylistTrackListBodyDto,
  SynologyPlaylistUpdateSmartBodyDto,
  SynologyPlaylistWithItemsDataDto,
  SynologySmartListRule,
} from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';
import type { PlaylistItem, SmartPlaylistRule } from 'src/playlists/types';

function ruleToRow(rule: SmartPlaylistRule): SynologyPlaylistRuleDto {
  let interval: number;
  switch (rule.interval) {
    case SmartPlaylistIntervalTagEnum.DAYS:
      interval = 1;
      break;
    case SmartPlaylistIntervalTagEnum.WEEKS:
      interval = 2;
      break;
    case SmartPlaylistIntervalTagEnum.MONTHS:
      interval = 3;
      break;
    default:
      interval = 0;
  }
  let op: number;
  switch (rule.operation) {
    case SmartPlaylistOperationEnum.IS:
      op = 1;
      break;
    case SmartPlaylistOperationEnum.IS_NOT:
      op = 2;
      break;
    case SmartPlaylistOperationEnum.CONTAINS:
      op = 3;
      break;
    case SmartPlaylistOperationEnum.DOES_NOT_CONTAIN:
      op = 4;
      break;
    case SmartPlaylistOperationEnum.LESS_THAN:
      op = 5;
      break;
    case SmartPlaylistOperationEnum.GREATER_THAN_OR_EQUAL_TO:
      op = 6;
      break;
    case SmartPlaylistOperationEnum.IN_THE_LAST:
      op = 7;
      break;
    case SmartPlaylistOperationEnum.NOT_IN_THE_LAST:
      op = 8;
      break;
    case SmartPlaylistOperationEnum.AFTER:
      op = 9;
      break;
    case SmartPlaylistOperationEnum.BEFORE:
      op = 10;
      break;
    default:
      op = 0;
  }
  let tag: number;
  switch (rule.field) {
    case SmartPlaylistFieldEnum.ARTIST:
      tag = 1;
      break;
    case SmartPlaylistFieldEnum.ALBUM:
      tag = 2;
      break;
    case SmartPlaylistFieldEnum.ALBUM_ARTIST:
      tag = 3;
      break;
    case SmartPlaylistFieldEnum.COMPOSER:
      tag = 4;
      break;
    case SmartPlaylistFieldEnum.GENRE:
      tag = 5;
      break;
    case SmartPlaylistFieldEnum.FILE_PATH:
      tag = 6;
      break;
    case SmartPlaylistFieldEnum.YEAR:
      tag = 7;
      break;
    case SmartPlaylistFieldEnum.BIT_RATE:
      tag = 8;
      break;
    case SmartPlaylistFieldEnum.DATE_ADDED:
      tag = 9;
      break;
    case SmartPlaylistFieldEnum.RATING:
      tag = 10;
      break;
    default:
      tag = 0;
  }
  return {
    interval,
    op,
    tag,
    tagval: rule.value,
  };
}

function toRuleInputs(rules: SynologySmartListRule[]): SmartPlaylistRule[] {
  return rules.map((rule) => ({
    id: 0,
    field: rule.fieldName as SmartPlaylistFieldEnum,
    interval: rule.intervalName,
    operation: rule.operationName as SmartPlaylistOperationEnum,
    value: rule.tagval,
  }));
}

@Injectable()
export class SynologyPlaylistService {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly playlistsService: PlaylistsService,
  ) {}

  private async getPlaylist(accountId: number, playlistName: string) {
    return this.playlistsService.getPlaylistByName(accountId, playlistName);
  }

  async addItem(accountId: number, body: SynologyPlaylistAddOrRemoveItemBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    const items: PlaylistItem[] = [];
    body.songs.forEach((id) => {
      // if the id is a number then it is a file
      if (typeof id === 'number') {
        items.push({ trackId: id });
      } else if (typeof id === 'string' && id.startsWith('radio_')) {
        items.push({
          radioStationTitle: id.substring(6).split(' ').slice(0, -1).join(' '),
          radioStationUrl: id.substring(id.lastIndexOf(' ') + 1),
        });
      }
    });
    await this.playlistsService.addItems(accountId, playlist.id, items, body.offset);
  }

  async createPlaylist(accountId: number, body: SynologyPlaylistCreateNormalBodyDto) {
    const playlist = await this.playlistsService.createPlaylist(accountId, body.name, PlaylistTypeEnum.NORMAL);
    return {
      id: `playlist_personal_normal/${playlist.name}`,
    };
  }

  async createSmartPlaylist(accountId: number, body: SynologyPlaylistCreateSmartBodyDto) {
    await this.playlistsService.createPlaylist(
      accountId,
      body.name,
      PlaylistTypeEnum.SMART,
      body.conj_rule,
      toRuleInputs(body.rules_json),
    );
    return {
      id: `playlist_personal_smart/${body.name}`,
    };
  }

  async deletePlaylist(accountId: number, body: SynologyPlaylistDeleteBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    await this.playlistsService.deletePlaylist(accountId, playlist.id);
  }

  async getPlaylists(accountId: number): Promise<SynologyPlaylistDataDto> {
    const playlists = await this.playlistsService.listPlaylists(accountId);
    return {
      offset: 0,
      total: playlists.total,
      playlists: playlists.playlists.map((playlist) => ({
        id: `playlist_personal_${playlist.type}/${playlist.name}`,
        library: 'personal',
        name: playlist.name,
        sharing_status: 'none',
        type: playlist.type,
        additional: {
          rules: (playlist.rules || []).map(ruleToRow),
          rules_conjunction: playlist.rulesConjugal,
          sharing_info: {
            date_available: 0,
            date_expired: 0,
            id: '',
            url: '',
            status: 'none',
          },
        },
      })),
    };
  }

  async getItems(accountId: number, body: SynologyPlaylistTrackListBodyDto): Promise<SynologyPlaylistWithItemsDataDto> {
    const playlist = await this.getPlaylist(accountId, body.id);
    const itemIds = (await this.playlistsService.listItems(accountId, playlist.id)).items;
    const tracks = await this.libraryService.listTracks(accountId, {}, 0, 100_000);
    const radioStationTrack = {
      albumArtists: [],
      albumTitle: '',
      artists: [],
      comment: '',
      composers: [],
      discNumber: 0,
      duration: 0,
      fileBitRate: 0,
      fileChannels: 0,
      fileFrequency: 0,
      filePath: '',
      fileSize: 0,
      fileType: FileTypeEnum.FLAC,
      genres: [],
      id: '',
      title: '',
      trackNumber: 0,
      year: 0,
    };
    return {
      playlists: [
        {
          id: `playlist_personal_normal/${playlist.name}`,
          library: 'personal',
          name: playlist.name,
          sharing_status: 'none',
          type: playlist.type,
          additional: {
            sharing_info: {
              date_available: 0,
              date_expired: 0,
              id: '',
              url: '',
              status: 'none',
            },
            songs_offset: body.offset,
            songs_total: tracks.items.length,
            songs: itemIds.map((item) => {
              const track = tracks.items.find((t) => t.id === item.trackId) || radioStationTrack;
              const id = track.id
                ? `music_${track.id}`
                : // eslint-disable-next-line max-len
                  `remote_{"album":""\\,"artist":""\\,"cover":""\\,"duration":0\\,"title":"${item.radioStationTitle}"}\n ${item.radioStationUrl}}`;
              return {
                id,
                position: item.position,
                path: track?.filePath || item.radioStationUrl || '',
                title: track?.title || item.radioStationTitle || '',
                type: track.id ? ContentTypeEnum.FILE : ContentTypeEnum.REMOTE,
                additional: {
                  song_audio: {
                    bitrate: track?.fileBitRate || 0,
                    channel: track?.fileChannels || 0,
                    codec: track?.fileType || FileTypeEnum.FLAC,
                    container: track?.fileType || FileTypeEnum.FLAC,
                    duration: track?.duration || 0,
                    filesize: track?.fileSize || 0,
                    frequency: track?.fileFrequency || 0,
                  },
                  song_rating: {
                    rating: 0,
                  },
                  song_tag: {
                    album: track.albumTitle || 'sbin',
                    artist: track.artists?.map((artist) => artist.name)?.join(', ') || '',
                    album_artist: track.albumArtists?.map((artist) => artist.name)?.join(', ') || '',
                    composer: track.composers.map((composer) => composer.name)?.join(', ') || '',
                    comment: track.comment || '',
                    genre: track.genres?.map((genre) => genre.name)?.join(', ') || '',
                    title: track.title || '',
                    track: track.trackNumber || 0,
                    year: track.year || 0,
                    disc: track.discNumber || 0,
                  },
                },
              };
            }),
          },
        },
      ],
    };
  }

  async getPlaylistInfo(accountId: number, body: SynologyPlaylistRetrieveBodyDto): Promise<SynologyPlaylistDataDto> {
    const playlist = await this.getPlaylist(accountId, body.id);
    const isSmart = playlist.type === PlaylistTypeEnum.SMART;
    return {
      offset: 0,
      total: 1,
      playlists: [
        {
          id: `playlist_personal_${playlist.type}/${playlist.name}`,
          library: 'personal',
          name: playlist.name,
          sharing_status: 'none',
          type: playlist.type,
          additional: {
            ...(isSmart
              ? {
                  rules: (playlist.rules || []).map(ruleToRow),
                  rules_conjunction: playlist.rulesConjugal,
                }
              : {}),
            sharing_info: {
              date_available: 0,
              date_expired: 0,
              id: '',
              url: '',
              status: 'none',
            },
          },
        },
      ],
    };
  }

  async moveItem(accountId: number, body: SynologyPlaylistAddOrRemoveItemBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    const { items } = await this.playlistsService.listItems(accountId, playlist.id);
    const movingItemIds = items
      .filter((item) => {
        const idValue = item.trackId || `radio_${item.radioStationTitle} ${item.radioStationUrl}`;
        return body.songs.includes(idValue);
      })
      .map((item) => item.id);
    await this.playlistsService.moveItems(accountId, playlist.id, movingItemIds, body.offset);
  }

  async removeItem(accountId: number, body: SynologyPlaylistAddOrRemoveItemBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    const contents = await this.playlistsService.listItems(accountId, playlist.id);
    const removingItemIds = contents.items.slice(body.offset, body.offset + body.limit).map((item) => item.id);
    await this.playlistsService.removeItems(accountId, playlist.id, removingItemIds);
  }

  async renamePlaylist(accountId: number, body: SynologyPlaylistRenameBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    if (playlist.name !== body.new_name) {
      await this.playlistsService.updatePlaylist(accountId, playlist.id, body.new_name);
    }
    return {
      id: `playlist_personal_${PlaylistTypeEnum.NORMAL}/${replaceDoubleQuotes(body.new_name)}`,
    };
  }

  async updateSmartPlaylist(accountId: number, body: SynologyPlaylistUpdateSmartBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    if (playlist.name !== body.name) {
      await this.playlistsService.updatePlaylist(accountId, playlist.id, body.name);
    }
    await this.playlistsService.updatePlaylistRules(
      accountId,
      playlist.id,
      body.conj_rule,
      toRuleInputs(body.rules_json),
    );
    return {
      id: `playlist_personal_${PlaylistTypeEnum.SMART}/${replaceDoubleQuotes(body.name)}`,
    };
  }
}
