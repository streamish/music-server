import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  FolderEntity,
  PlaylistEntity,
  RootPathEntity,
  ShoutcastStationEntity,
  TrackEntity,
} from 'src/database/entities';
import {
  AlbumSortFieldEnum,
  AssociationSortFieldEnum,
  AssociationTypeEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { AssociationFilter } from './types/association-filter';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './dtos/library.album.dto';
import { LibraryAssociationDto } from './dtos/library.association.dto';
import { LibraryAssociationWithTracksDto } from './dtos/library.association-with-tracks.dto';
import { LibraryFavoriteDto, LibraryFolderDto, LibraryTrackDto } from './dtos';
import { LibraryQueryService } from './query.service';
import { LibraryTransformerService } from './transformer.service';
import { Op } from 'sequelize';
import { TrackFilter } from './types/track-filter';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AlbumFilter } from './types/album-filter';
import type { ListResult } from '../types/list-result';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    @InjectModel(AssociationLinkEntity)
    private readonly associationLinkEntity: typeof AssociationLinkEntity,
    @InjectModel(FavoriteItemEntity)
    private readonly favoriteItemEntity: typeof FavoriteItemEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    private readonly queryService: LibraryQueryService,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    private readonly transformerService: LibraryTransformerService,
  ) {}

  /**
   * Returns lists of album-associated artists, composers or genres optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param accountId The media owner account ID
   * @param filter The filter criteria for the associations
   * @param offset The offset for pagination
   * @param limit The limit for pagination
   * @param sortField The field to sort the results by
   * @param sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<ListResult<LibraryAssociationDto>>}
   */
  async listAlbumAssociations(
    accountId: number,
    filter: AssociationFilter,
    offset: number,
    limit: number,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAssociationDto>> {
    const query = await this.queryService.buildAlbumAssociationQuery(accountId, filter, sortField, sortDirection);
    const associations = await this.associationLinkEntity.findAll({
      ...query,
      offset,
      limit,
      group: ['association.name'],
      subQuery: false,
    });
    const totals = await this.associationLinkEntity.count({
      ...query,
      group: ['association.name'],
    });
    return {
      items: associations.map((link) =>
        this.transformerService.convertAssociationEntityToLibraryAssociation(link.association!),
      ),
      total: totals.length,
    };
  }

  /**
   * Returns a list of albums optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param accountId The media owner account ID
   * @param filter The search parameters for the albums
   * @param offset Optional pagination offset
   * @param limit Optional pagination limit
   * @param sortField Optional field to sort the results by
   * @param sortDirection Optional sort order specification
   * @returns The album list and total record count.
   */
  async listAlbums(
    accountId: number,
    filter: AlbumFilter,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    const query = await this.queryService.buildAlbumQuery(accountId, filter, sortField, sortDirection);
    const albums = await this.albumEntity.findAndCountAll({
      ...query,
      limit,
      offset,
      group: ['AlbumEntity.id'],
      subQuery: false,
    });
    return {
      total: albums.count.length,
      items: albums.rows.map(this.transformerService.convertAlbumEntityToLibraryAlbum),
    };
  }

  /**
   * Returns lists of album-associations containing track-associations, for instance album artists filtered by genre
   * optionally paginated, filtered and sorted by the specified parameters.
   * @param accountId The media owner account ID
   * @param filter The filter criteria for the associations
   * @param offset The offset for pagination
   * @param limit The limit for pagination
   * @param sortField The field to sort the results by
   * @param sortDirection The direction to sort the results (ASC or DESC)
   * @returns The list of associations with pagination information
   */
  async listAlbumAssociationsViaTracks(
    accountId: number,
    filter: AssociationFilter,
    offset: number,
    limit: number,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAssociationDto>> {
    const query = await this.queryService.buildAlbumTrackAssociationQuery(accountId, filter, sortField, sortDirection);
    const associations = await this.associationEntity.findAll({
      ...query,
      offset,
      limit,
      group: ['name'],
    });
    const totals = await this.associationEntity.count({
      ...query,
      group: ['name'],
    });
    return {
      items: associations.map((association) =>
        this.transformerService.convertAssociationEntityToLibraryAssociation(association),
      ),
      total: totals.length,
    };
  }

  /**
   * Returns a list of favorites with related track, album, association, and playlist data, optionally paginated.
   * @param accountId The media owner account ID
   * @param [offset] Optional pagination offset
   * @param [limit] Optional pagination limit
   * @returns The favorite list and total record count.
   */
  async listFavorites(accountId: number, offset?: number, limit?: number): Promise<ListResult<LibraryFavoriteDto>> {
    const favorites = await this.favoriteItemEntity.findAll({
      where: {
        accountId,
      },
      include: [
        {
          model: TrackEntity,
          required: false,
        },
        {
          model: AlbumEntity,
          required: false,
        },
        {
          model: FolderEntity,
          required: false,
        },
        {
          model: AssociationEntity,
          required: false,
          include: [
            {
              model: AssociationLinkEntity,
              separate: true,
            },
          ],
        },
        {
          model: PlaylistEntity,
          required: false,
        },
        {
          model: ShoutcastStationEntity,
          required: false,
        },
      ],
      offset: offset || 0,
      limit: limit || 100_000,
    });
    const total = await this.favoriteItemEntity.count({
      where: {
        accountId,
      },
    });
    return {
      total,
      items: await Promise.all(
        favorites.map(async (favorite) => {
          const albums: LibraryAlbumWithTracksDto[] = [];
          if (favorite.associationId && favorite.associationType) {
            const albumArtist =
              favorite.associationType === AssociationTypeEnum.ARTIST
                ? await this.retrieveAlbumAssociation(
                    favorite.accountId,
                    favorite.associationId,
                    AssociationTypeEnum.ARTIST,
                  )
                : [];
            const trackAssociations = await this.retrieveTrackAssociation(
              favorite.accountId,
              favorite.associationId,
              favorite.associationType,
            );
            const allAlbums: LibraryAlbumWithTracksDto[] = [
              ...(albumArtist[0]?.albums || []),
              ...(trackAssociations[0]?.albums || []),
            ]
              .flat()
              .filter(Boolean);
            albums.push(...allAlbums);
          }
          let folder: LibraryFolderDto | undefined;
          if (favorite.folderId) {
            folder = await this.listFolderContents(accountId, favorite.folderId);
          }
          return this.transformerService.convertFavoriteItemEntityToLibraryFavorite(favorite, albums, folder);
        }),
      ),
    };
  }

  /**
   * Lists the contents of a path relative to the account's root folder(s).  The root folder contents
   * are combined into a single view, eg `/root1/artist1` and `/root2/artist1` would both appear under
   * the folder `/artist1`.
   * @param accountId The media owner account ID
   * @param folderId The ID of the folder to list the contents of
   * @returns The tree structure of folders for the account
   */
  async listFolderContents(accountId: number, folderId: number): Promise<LibraryFolderDto> {
    const folder = await this.folderEntity.findOne({
      where: {
        accountId,
        id: folderId,
      },
    });
    if (!folder) {
      throw new NotFoundException(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    }
    const rootFolders = await this.rootPathEntity.findAll({
      where: {
        accountId,
      },
    });
    const favorites = await this.favoriteItemEntity.findAll({
      where: {
        accountId,
        [Op.or]: [
          {
            folderId: {
              [Op.gt]: 0,
            },
          },
          {
            trackId: {
              [Op.gt]: 0,
            },
          },
        ],
      },
    });
    const favoriteIndex: Record<number, number> = {};
    for (let i = 0, len = favorites.length; i < len; i += 1) {
      const favorite = favorites[i];
      if (favorite?.folderId) {
        favoriteIndex[favorite.folderId] = favorite.id;
      }
      if (favorite?.trackId) {
        favoriteIndex[favorite.trackId] = favorite.id;
      }
    }
    const items: LibraryFolderDto[] = [];
    for (let i = 0, len = rootFolders.length; i < len; i += 1) {
      const rootFolder = rootFolders[i];
      if (rootFolder) {
        const combinedPath = join(rootFolder.rootPath, folder.folderPath);
        if (existsSync(combinedPath)) {
          const folderContents = readdirSync(combinedPath, { withFileTypes: true });
          for (let j = 0, jLen = folderContents.length; j < jLen; j += 1) {
            const entry = folderContents[j];
            if (entry) {
              const isDirectory = entry.isDirectory();
              const entryPath = join(combinedPath, entry.name);
              const relativePath = join(folder.folderPath, entry.name);
              if (isDirectory) {
                // eslint-disable-next-line no-await-in-loop
                const nestedFolder = await this.folderEntity.findOne({
                  attributes: ['id'],
                  where: {
                    accountId,
                    folderPath: relativePath,
                  },
                });
                if (nestedFolder) {
                  items.push({
                    folder: entry.name,
                    fullPath: entryPath,
                    relativePath,
                    id: nestedFolder.id,
                    favoriteId: favoriteIndex[nestedFolder.id] || undefined,
                    children: [],
                  });
                }
              } else {
                // eslint-disable-next-line no-await-in-loop
                const track = await this.trackEntity.findOne({
                  attributes: ['id'],
                  where: {
                    accountId,
                    filePath: relativePath,
                    rootPathId: rootFolder.id,
                  },
                });
                if (track) {
                  // eslint-disable-next-line no-await-in-loop
                  const trackData = await this.retrieveTrack(accountId, [track.id]);
                  items.push({
                    file: entry.name,
                    favoriteId: favoriteIndex[track.id] || undefined,
                    fullPath: entryPath,
                    relativePath,
                    id: track?.id || 0,
                    track: trackData[0],
                    children: [],
                  });
                }
              }
            }
          }
        }
      }
    }
    return {
      id: folderId,
      fullPath: folder.folderPath,
      relativePath: folder.folderPath,
      favoriteId: favoriteIndex[folder.id] || undefined,
      children: items,
    };
  }

  /**
   * Lists the contents of a path relative to the account's root folder(s).  The root folder contents
   * are combined into a single view, eg `/root1/artist1` and `/root2/artist1` would both appear under
   * the folder `/artist1`.
   * @param accountId The media owner account ID
   * @param folderPath The path of the folder to list the contents of
   * @returns The tree structure of folders for the account
   */
  async listFolderContentsByPath(accountId: number, folderPath: string): Promise<LibraryFolderDto> {
    const folder = await this.folderEntity.findOne({
      where: {
        accountId,
        folderPath,
      },
    });
    if (!folder) {
      throw new NotFoundException(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    }
    return this.listFolderContents(accountId, folder.id);
  }

  /**
   * Returns a list of tracks optionally paginated, filtered and sorted by the specified parameters
   * @param accountId The media owner account ID
   * @param filter The search parameters for the tracks
   * @param offset The number of items to skip before starting to collect the result set
   * @param limit The maximum number of items to return
   * @param [sortField] The field by which to sort the tracks
   * @param [sortDirection] The direction in which to sort the tracks
   * @returns The list of tracks with their albums and track details.
   */
  async listTracks(
    accountId: number,
    filter: TrackFilter,
    offset: number,
    limit: number,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryTrackDto>> {
    const query = await this.queryService.buildTrackQuery(accountId, filter, sortField, sortDirection);
    const data = await this.trackEntity.findAll({
      ...query,
      limit,
      offset,
      subQuery: false,
    });
    const count = await this.trackEntity.count({
      ...query,
    });
    return {
      items: data.map(this.transformerService.convertTrackEntityToLibraryTrack),
      total: count,
    };
  }

  /**
   * Returns lists of track-associated artists, composers or genres, optionally paginated, filtered and sorted
   * by the specified parameters.
   * @param accountId The media owner account ID
   * @param filter
   * @param offset
   * @param limit
   * @param sortField
   * @param sortDirection
   * @returns {Promise<ListResult<LibraryAssociationDto>>}
   */
  async listTrackAssociations(
    accountId: number,
    filter: AssociationFilter,
    offset: number,
    limit: number,
    sortField?: AssociationSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAssociationDto>> {
    const query = await this.queryService.buildTrackAssociationQuery(accountId, filter, sortField, sortDirection);
    const associations = await this.associationEntity.findAll({ ...query, offset, limit, group: ['name'] });
    const totals = await this.associationEntity.count({ ...query, group: ['name'] });
    return {
      total: totals.length,
      items: associations.map(this.transformerService.convertAssociationEntityToLibraryAssociation),
    };
  }

  /**
   * Retrieves one or more albums along with their associated tracks.
   * @param accountId The media owner account ID
   * @param albumIds The IDs of the albums to retrieve
   * @throws If any specified album is not found
   * @returns An array of one or more albums
   */
  async retrieveAlbum(accountId: number, albumIds: number | number[]): Promise<LibraryAlbumWithTracksDto[]> {
    const query = await this.queryService.buildAlbumQuery(accountId, {});
    const albums = await this.albumEntity.findAll({
      ...query,
      where: {
        ...query.where,
        id: albumIds,
      },
    });
    if (!albums || albums.length === 0 || (Array.isArray(albumIds) && albums.length < albumIds.length)) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    albums.sort((a, b) => {
      if (Array.isArray(albumIds)) {
        return albumIds.indexOf(a.id) - albumIds.indexOf(b.id);
      }
      return 0;
    });
    const tracks = await this.listTracks(
      accountId,
      {
        albumIds: Array.isArray(albumIds) ? albumIds : [albumIds],
      },
      0,
      100_000,
    );
    albums.map(async (album) => {
      const builtAlbum = await this.transformerService.convertAlbumEntityToLibraryAlbum(album);
      const albumTracks = tracks.items.filter((track) => track.albumId === album.id);
      return {
        ...builtAlbum,
        tracks: albumTracks,
      };
    });
    return albums.map((album) => {
      const builtAlbum = this.transformerService.convertAlbumEntityToLibraryAlbum(album);
      const albumTracks = tracks.items.filter((track) => track.albumId === album.id);
      return {
        ...builtAlbum,
        tracks: albumTracks,
      };
    });
  }

  /**
   * Retrieves one or more associations of the specified type with their albums.
   * @param accountId The media owner account ID
   * @param associationIds The IDs of the associations to retrieve
   * @param associationType The type of association (artist, composer, or genre)
   * @throws If any specified association is not found
   * @returns An array of associations with their associated albums
   */
  async retrieveAlbumAssociation(
    accountId: number,
    associationIds: number | number[],
    associationType: AssociationTypeEnum,
  ): Promise<LibraryAssociationWithTracksDto[]> {
    const trackQuery = await this.queryService.buildTrackAssociationQuery(accountId, {
      ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
      ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
      ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
    });
    const associations = await this.associationEntity.findAll({
      ...trackQuery,
      include: [
        {
          ...(Array.isArray(trackQuery.include) ? trackQuery.include : []),
          model: AssociationLinkEntity,
          where: {
            albumId: {
              [Op.gte]: 0,
            },
            ...(associationType === AssociationTypeEnum.ARTIST ? { isArtist: true } : {}),
            ...(associationType === AssociationTypeEnum.COMPOSER ? { isComposer: true } : {}),
            ...(associationType === AssociationTypeEnum.GENRE ? { isGenre: true } : {}),
          },
        },
      ],
      where: {
        ...trackQuery.where,
        id: associationIds,
      },
    });
    if (!associations || associations.length === 0) {
      return [];
    }
    associations.sort((a, b) => {
      if (Array.isArray(associationIds)) {
        return associationIds.indexOf(a.id) - associationIds.indexOf(b.id);
      }
      return 0;
    });
    const albumIds = Array.from(
      new Set(
        associations.map((association) => (association.associationLinks || []).map((link) => link.albumId || 0)).flat(),
      ),
    );
    const albums = await this.retrieveAlbum(accountId, albumIds);
    return associations.map((association) => {
      const builtAssociation = this.transformerService.convertAssociationEntityToLibraryAssociation(association);
      return {
        ...builtAssociation,
        albums,
      };
    });
  }

  /**
   * Retrieves one or more associations of the specified type with their tracks.
   * @param accountId The media owner account ID
   * @param associationIds The IDs of the associations to retrieve
   * @param associationType The type of association (artist, composer, or genre)
   * @throws If any specified association is not found
   * @returns An array of associations
   */
  async retrieveTrackAssociation(
    accountId: number,
    associationIds: number | number[],
    associationType: AssociationTypeEnum,
  ): Promise<LibraryAssociationWithTracksDto[]> {
    const associationQuery = await this.queryService.buildTrackAssociationQuery(accountId, {
      isArtist: associationType === AssociationTypeEnum.ARTIST ? true : undefined,
      isComposer: associationType === AssociationTypeEnum.COMPOSER ? true : undefined,
      isGenre: associationType === AssociationTypeEnum.GENRE ? true : undefined,
    });
    const associations = await this.associationEntity.findAll({
      ...associationQuery,
      where: {
        ...associationQuery.where,
        id: associationIds,
      },
    });
    if (!associations || associations.length === 0) {
      return [];
    }
    associations.sort((a, b) => {
      if (Array.isArray(associationIds)) {
        return associationIds.indexOf(a.id) - associationIds.indexOf(b.id);
      }
      return a.id === associationIds ? -1 : 1;
    });
    const trackIds = associations.flatMap((a) => (a.associationLinks || []).map((link) => link.trackId));
    const tracks = await this.retrieveTrack(accountId, trackIds);
    const albumIds = Array.from(new Set(tracks.map((track) => track.albumId)));
    const albums = await this.retrieveAlbum(accountId, albumIds);
    return associations.map((association) => {
      const builtAssociation = this.transformerService.convertAssociationEntityToLibraryAssociation(association);
      const associationTrackIds = Array.from(new Set((association.associationLinks || []).map((link) => link.trackId)));
      const associationTracks = tracks.filter((track) => associationTrackIds.includes(track.id));
      const associationAlbumIds = Array.from(new Set(associationTracks.map((track) => track.albumId)));
      return {
        ...builtAssociation,
        albums: albums
          .filter((album) => associationAlbumIds.includes(album.id))
          .map((album) => {
            const albumTracks = associationTracks.filter((track) => track.albumId === album.id);
            return {
              ...album,
              tracks: albumTracks,
            };
          }),
      };
    });
  }

  /**
   * Retrieves one or more tracks.
   * @param accountId The media owner account ID
   * @param trackIds The IDs of the tracks to retrieve
   * @throws If any specified track is not found
   * @returns An array of tracks
   */
  async retrieveTrack(accountId: number, trackIds: number | number[]): Promise<LibraryTrackDto[]> {
    const query = await this.queryService.buildTrackQuery(accountId, {});
    const tracks = await this.trackEntity.findAll({
      ...query,
      where: {
        ...query.where,
        id: trackIds,
      },
    });
    if (!tracks || tracks.length === 0 || (Array.isArray(trackIds) && tracks.length < trackIds.length)) {
      throw new NotFoundException(ErrorCodes.TRACKS_NOT_FOUND_ERROR);
    }
    return tracks.map(this.transformerService.convertTrackEntityToLibraryTrack);
  }
}
