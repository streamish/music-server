import {
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  SessionEntity,
  TrackEntity,
} from 'src/database/entities';
import { AssociationTypeEnum, SessionRestrictionEnum } from 'src/types/enums';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { LibraryFavoriteDto, LibraryFolderDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { Op } from 'sequelize';
import {
  SynologyEntryCertificateDataDto,
  SynologyEntryNewPinItemDto,
  SynologyEntryPinItemDto,
  SynologyEntryPinsDataDto,
  SynologyEntrySignInBodyDto,
  SynologyEntrySignInDataDto,
} from './dtos';
import { SynologyPinTypeEnum } from './enums';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';
import { readFileSync } from 'node:fs';
import { sep } from 'node:path';
import crypto from 'node:crypto';

function favoriteToRow(item: LibraryFavoriteDto): SynologyEntryPinItemDto {
  return {
    id: item.id.toString(),
    criteria: {
      album: item.album?.title,
      album_artist: item.associationType === AssociationTypeEnum.ARTIST ? item.association?.name : undefined,
      artist: item.associationType === AssociationTypeEnum.ARTIST ? item.association?.name : undefined,
      composer: item.associationType === AssociationTypeEnum.COMPOSER ? item.association?.name : undefined,
      genre: item.associationType === AssociationTypeEnum.GENRE ? item.association?.name : undefined,
      folder: item.folder ? `dir_${item.folder?.folder}` : undefined,
      playlist: item.playlist?.name,
    },
    name:
      item.association?.name ||
      item.album?.title ||
      item.folder?.folder?.split(sep).pop() ||
      item.playlist?.name ||
      (item.allSongs ? 'All songs' : undefined) ||
      (item.randomHundred ? 'Random 100' : undefined) ||
      (item.recentlyAdded ? 'Recently added' : undefined) ||
      'Unknown',
    type:
      (item.associationType === AssociationTypeEnum.ARTIST ? SynologyPinTypeEnum.ARTIST : '') ||
      (item.associationType === AssociationTypeEnum.COMPOSER ? SynologyPinTypeEnum.COMPOSER : '') ||
      (item.associationType === AssociationTypeEnum.GENRE ? SynologyPinTypeEnum.GENRE : '') ||
      (item.playlist?.id ? SynologyPinTypeEnum.PLAYLIST : '') ||
      (item.album?.id ? SynologyPinTypeEnum.ALBUM : '') ||
      (item.folder ? SynologyPinTypeEnum.FOLDER : '') ||
      (item.allSongs ? SynologyPinTypeEnum.ALBUM : '') ||
      (item.randomHundred ? SynologyPinTypeEnum.RANDOM_100 : '') ||
      (item.recentlyAdded ? SynologyPinTypeEnum.RECENTLY_ADDED : '') ||
      SynologyPinTypeEnum.ALBUM, // default to album if no type is found
  };
}

@Injectable()
export class SynologyEntryService {
  publicKey: string;

  privateKey: crypto.KeyObject;

  constructor(
    @Inject(AuthenticationService)
    private readonly authenticationService: AuthenticationService,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private readonly libraryService: LibraryService,
    @InjectModel(FavoriteItemEntity)
    private readonly favoriteItemEntity: typeof FavoriteItemEntity,
    @InjectModel(PlaylistEntity)
    private readonly playlistEntity: typeof PlaylistEntity,
    @InjectModel(PlaylistItemEntity)
    private readonly playlistItemEntity: typeof PlaylistItemEntity,
    @InjectModel(SessionEntity)
    private readonly sessionEntity: typeof SessionEntity,
  ) {
    const publicKey = readFileSync(this.configService.get('SYNOLOGY_PUBLIC_KEY_PATH')).toString('utf8');
    this.publicKey = publicKey
      .split('\n')
      .filter((line) => !line.includes('BEGIN PUBLIC KEY') && !line.includes('END PUBLIC KEY'))
      .join('');
    const privateKeyData = readFileSync(this.configService.get('SYNOLOGY_PRIVATE_KEY_PATH')).toString('utf8');
    this.privateKey = crypto.createPrivateKey({
      key: privateKeyData,
      format: 'pem',
      type: 'pkcs8',
    });
  }

  getEncryptionKey(): SynologyEntryCertificateDataDto {
    return {
      cipherkey: '__cIpHeRtExT',
      ciphertoken: '__cIpHeRtOkEn',
      public_key: this.publicKey,
      server_time: Math.floor(Date.now() / 1000),
    };
  }

  private async getAssociationId(accountId: number, associationName: string): Promise<number> {
    const association = await this.associationEntity.findOne({
      attributes: ['id'],
      where: {
        accountId,
        name: replaceDoubleQuotes(associationName),
      },
    });
    if (!association) {
      throw new NotFoundException(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR);
    }
    return association.id;
  }

  private async getPlaylist(accountId: number, playlistId: string) {
    const playlist = await this.playlistEntity.findOne({
      where: {
        accountId,
        name: playlistId,
      },
    });
    if (!playlist) {
      throw new Error(`Playlist with id ${playlistId} not found`);
    }
    return playlist;
  }

  async authenticate(userAgent: string, body: SynologyEntrySignInBodyDto): Promise<SynologyEntrySignInDataDto> {
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      // eslint-disable-next-line no-underscore-dangle
      Buffer.from(body.__cIpHeRtExT, 'base64'),
    );
    const plainText = decrypted.toString('utf8');
    const queryString = new URLSearchParams(plainText);
    const username = queryString.get('account');
    const password = queryString.get('passwd');
    if (!username?.length || !password?.length) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid encrypted payload',
        body,
      });
    }
    const jwtToken = await this.authenticationService.createSession(
      username,
      password,
      userAgent,
      SessionRestrictionEnum.SYNOLOGY_AUDIOSTATION,
      3650,
    );
    const userAgentHash = await this.authenticationService.generateDeviceHash(username, userAgent);
    return {
      did: userAgentHash,
      sid: jwtToken,
      is_portal_port: false,
    };
  }

  async clearSessionToken(accountId: number, sessionId: number): Promise<unknown> {
    const session = await this.sessionEntity.findByPk(sessionId);
    if (!session || session.accountId !== accountId) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid session ID',
        sessionId,
      });
    }
    await this.authenticationService.endSession(accountId, sessionId);
    return {
      success: true,
    };
  }

  async listPinnedItems(accountId: number, offset: number, limit: number): Promise<SynologyEntryPinsDataDto> {
    const data = await this.libraryService.listFavorites(accountId, offset, limit);
    return {
      items: data.items.map(favoriteToRow),
      offset: offset || 0,
      total: data.total,
    };
  }

  async createPinnedItem(accountId: number, items: SynologyEntryNewPinItemDto[]): Promise<SynologyEntryPinsDataDto> {
    let tree: LibraryFolderDto[] | undefined;
    function findTreeItem(id: number, branch: LibraryFolderDto[]): LibraryFolderDto | undefined {
      if (!branch) {
        return undefined;
      }
      for (let i = 0, len = branch.length; i < len; i += 1) {
        const item = branch[i];
        if (item) {
          if (item.id === id) {
            return item;
          }
          if (item.children) {
            const found = findTreeItem(id, item.children);
            if (found) {
              return found;
            }
          }
        }
      }
      return undefined;
    }

    for (let i = 0, len = items.length; i < len; i += 1) {
      const item = items[i];
      if (item) {
        let playlistId;
        if (item.criteria.album && item.criteria.album_artist) {
          // eslint-disable-next-line no-await-in-loop
          const albums = await this.libraryService.listAlbums(
            accountId,
            {
              filter: item.criteria.album,
              artist: [item.criteria.album_artist],
            },
            0,
            1,
          );
          const albumId = albums.items[0]?.id;
          if (!albumId) {
            throw new NotFoundException({
              success: false,
              message: 'Album not found',
              album: item.criteria.album,
            });
          }
          // eslint-disable-next-line no-await-in-loop
          await this.libraryService.setAlbumFavorite(accountId, albumId);
        } else if (
          item.criteria.album_artist ||
          item.criteria.artist ||
          item.criteria.composer ||
          item.criteria.genre
        ) {
          // eslint-disable-next-line no-await-in-loop
          const associationId = await this.getAssociationId(
            accountId,
            item.criteria.album_artist || item.criteria.artist || item.criteria.composer || item.criteria.genre || '',
          );
          let associationType: AssociationTypeEnum | undefined;
          if (item.criteria.artist) {
            associationType = AssociationTypeEnum.ARTIST;
            // } else if (item.criteria.album_artist) {
            //   associationType = AssociationTypeEnum.ALBUM_ARTIST;
          } else if (item.criteria.composer) {
            associationType = AssociationTypeEnum.COMPOSER;
          } else {
            associationType = AssociationTypeEnum.GENRE;
          }
          // eslint-disable-next-line no-await-in-loop
          await this.libraryService.setAssociationFavorite(accountId, associationId, associationType);
        } else if (item.type === 'folder') {
          if (!tree) {
            // eslint-disable-next-line no-await-in-loop
            tree = await this.libraryService.listFolders(accountId);
          }
          const itemId = Number.parseInt(item.criteria.folder || '1', 10);
          const treeItem = findTreeItem(itemId, tree);
          if (!treeItem?.folder?.length) {
            throw new NotFoundException({
              success: false,
              message: 'Folder not found',
              folder: item.criteria.folder,
            });
          }
          // eslint-disable-next-line no-await-in-loop
          await this.libraryService.setFolderFavorite(accountId, treeItem.folder);
        } else if (item.type === 'playlist') {
          // eslint-disable-next-line no-await-in-loop
          const playlist = await this.playlistEntity.findOne({
            attributes: ['id'],
            where: {
              accountId,
              name: replaceDoubleQuotes(item.name),
            },
          });
          if (!playlist) {
            throw new NotFoundException({
              success: false,
              message: 'Playlist not found',
              playlist: item.criteria.playlist,
            });
          }
          playlistId = playlist.id;
          // eslint-disable-next-line no-await-in-loop
          await this.favoriteItemEntity.create({
            accountId,
            playlistId,
          } as FavoriteItemEntity);
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.favoriteItemEntity.create({
            accountId,
            allSongs: item.name === 'All songs',
            playlistId,
            randomHundred: item.type === SynologyPinTypeEnum.RANDOM_100,
            recentlyAdded: item.type === SynologyPinTypeEnum.RECENTLY_ADDED,
          } as FavoriteItemEntity);
        }
      }
    }
    return this.listPinnedItems(accountId, 0, 100000);
  }

  async deletePinnedItem(accountId: number, itemIds: number[]): Promise<SynologyEntryPinsDataDto> {
    await this.libraryService.deleteFavoriteItem(accountId, itemIds);
    return this.listPinnedItems(accountId, 0, 100000);
  }

  async addAlbumToPlaylist(accountId: number, playlistId: string, albumTitle: string, albumArtist: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const albums = await this.libraryService.listAlbums(
      accountId,
      {
        filter: albumTitle,
        artist: [albumArtist],
      },
      0,
      1,
    );
    const albumId = albums.items[0]?.id;
    const tracks = await this.trackEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
        albumId,
      },
      order: [
        ['discNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['trackId'],
      where: {
        playlistId: playlist.id,
        trackId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.trackId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              trackId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addArtistToPlaylist(accountId: number, playlistId: string, artistName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const tracks = await this.trackEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
      },
      include: [
        {
          model: AssociationLinkEntity,
          required: true,
          where: { isArtist: true },
          as: 'artists',
          include: [
            {
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(artistName),
              },
            },
          ],
        },
      ],
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['trackId'],
      where: {
        playlistId: playlist.id,
        trackId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.trackId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              trackId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addComposerToPlaylist(accountId: number, playlistId: string, composerName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const tracks = await this.trackEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
      },
      include: [
        {
          model: AssociationLinkEntity,
          required: true,
          where: { isComposer: true },
          as: 'composers',
          include: [
            {
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(composerName),
              },
            },
          ],
        },
      ],
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['trackId'],
      where: {
        playlistId: playlist.id,
        trackId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.trackId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              trackId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addGenreToPlaylist(accountId: number, playlistId: string, genreName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const tracks = await this.trackEntity.findAll({
      attributes: ['id'],
      include: [
        {
          model: AssociationLinkEntity,
          required: true,
          where: { isGenre: true },
          as: 'genres',
          include: [
            {
              model: AssociationEntity,
              where: {
                nameNormalized: normalizeString(genreName),
              },
            },
          ],
        },
      ],
      where: {
        accountId,
      },
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['trackId'],
      where: {
        playlistId: playlist.id,
        trackId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.trackId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              trackId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }
}
