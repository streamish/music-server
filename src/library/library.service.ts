import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  PlaylistEntity,
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
import { LibraryAssociationDto, LibraryAssociationWithTracksDto } from './dtos/library.association.dto';
import { LibraryFavoriteDto, LibraryFolderDto, LibraryTrackDto } from './dtos';
import { LibraryQueryService } from './query.service';
import { LibraryTransformerService } from './transformer.service';
import { Op } from 'sequelize';
import { TrackFilter } from './types/track-filter';
import { sep } from 'node:path';
import type { AlbumFilter } from './types/album-filter';
import type { ListResult } from './types/list-result';
import type { Rating, RatingOrUnset } from 'src/types';

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
    private readonly queryService: LibraryQueryService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    private readonly transformerService: LibraryTransformerService,
  ) {}

  /**
   * Deletes the specified favorite item
   * @param accountId The ID of the account to delete the favorite item for
   * @param favoriteItemId The ID of the favorite item to delete
   * @throws {NotFoundException} If the favorite item does not exist for the specified account
   */
  async deleteFavoriteItem(accountId: number, favoriteItemId: number | number[]): Promise<void> {
    const favoriteItems = await this.favoriteItemEntity.findAll({
      where: {
        id: favoriteItemId,
        accountId,
      },
      attributes: ['id'],
    });
    if (!favoriteItems.length || (Array.isArray(favoriteItemId) && favoriteItems.length !== favoriteItemId.length)) {
      throw new NotFoundException(ErrorCodes.FAVORITE_ITEM_NOT_FOUND_ERROR);
    }
    await this.favoriteItemEntity.destroy({
      where: {
        id: favoriteItemId,
        accountId,
      },
    });
  }

  /**
   * Returns lists of album-associated artists, composers or genres optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param {number} accountId The ID of the account to filter by
   * @param {AssociationFilter} filter The filter criteria for the associations
   * @param {number} offset The offset for pagination
   * @param {number} limit The limit for pagination
   * @param {AssociationSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
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
   * Returns lists of album-associations containing track-associations, for instance album artists filtered by genre
   * optionally paginated, filtered and sorted by the specified parameters.
   * @param {number} accountId The ID of the account to filter by
   * @param {AssociationFilter} filter The filter criteria for the associations
   * @param {number} offset The offset for pagination
   * @param {number} limit The limit for pagination
   * @param {AssociationSortFieldEnum} sortField The field to sort the results by
   * @param {SortDirectionEnum} sortDirection The direction to sort the results (ASC or DESC)
   * @returns {Promise<ListResult<LibraryAssociationDto>>} The list of associations with pagination information
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
   * Returns lists of track-associated artists, composers or genres, optionally paginated, filtered and sorted
   * by the specified parameters.
   * @param {number} accountId
   * @param {AssociationFilter} filter
   * @param {number} offset
   * @param {number} limit
   * @param {AssociationSortFieldEnum} sortField
   * @param {SortDirectionEnum} sortDirection
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
   * Returns a list of albums optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param {number} accountId The user performing the search
   * @param {AlbumFilter} filter The search parameters for the albums
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortField Optional field to sort the results by
   * @param {SortDirectionEnum} sortDirection Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumDto>>} The album list and total record count.
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
   * Returns a list of favorites with related track, album, association, and playlist data, optionally paginated.
   * @param {number} accountId The user performing the search
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @returns {Promise<ListResult<LibraryFavoriteDto>>} The favorite list and total record count.
   */
  async listFavorites(accountId: number, offset: number, limit: number): Promise<ListResult<LibraryFavoriteDto>> {
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
      ],
      offset: offset || 0,
      limit: limit || 100_000,
    });
    const total = await this.favoriteItemEntity.count({
      where: {
        accountId,
      },
    });
    // optionally load the folders if any favorite has a folder path
    let folders: LibraryFolderDto[];
    if (favorites.find((f) => f.folderPath)) {
      folders = await this.listFolders(accountId);
    }
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
          return this.transformerService.convertFavoriteItemEntityToLibraryFavorite(favorite, folders, albums);
        }),
      ),
    };
  }

  /**
   * Lists all folders for a given account in a tree structure.
   * @param {number} accountId The user performing the search
   * @returns {Promise<LibraryFolderDto[]>} The tree structure of folders for the account
   */
  async listFolders(accountId: number): Promise<LibraryFolderDto[]> {
    const tracks = await this.listTracks(accountId, {}, 0, 100_000);
    function sortChildren(node: LibraryFolderDto) {
      node.children?.sort((a, b) => (a.folder || a.file || '').localeCompare(b.folder || b.file || ''));
      node.children?.forEach(sortChildren);
    }
    const root: LibraryFolderDto = {
      folder: '',
      file: '',
      fullPath: '',
      id: 0,
      children: [],
    };
    let folderId = 0;
    const directoryMap = new Map([['', root]]);
    for (let i = 0, len = tracks.items.length; i < len; i += 1) {
      const track = tracks.items[i];
      if (track) {
        const { filePath } = track;
        const parts = filePath.split('/').filter(Boolean);
        let currentPath = '';
        let parent = root;
        for (let j = 0, jLen = parts.length; j < jLen; j += 1) {
          const part = parts[j];
          if (part) {
            currentPath += `/${part}`;
            let node = directoryMap.get(currentPath);
            if (!node) {
              const isFile = j === parts.length - 1;
              if (!isFile) {
                folderId += 1;
              }
              node = {
                folder: isFile ? '' : part,
                fullPath: currentPath,
                track: isFile ? track : undefined,
                ...(isFile
                  ? { id: track.id, file: track.filePath.split(sep).pop() || '' }
                  : { children: [], id: folderId }),
              };
              parent.children?.push(node);
              directoryMap.set(currentPath, node);
            }
            parent = node;
          }
        }
      }
    }
    sortChildren(root);
    return root.children || [];
  }

  /**
   * Returns a list of tracks optionally paginated, filtered and sorted by the specified parameters
   * @param {number} accountId The user performing the search
   * @param {TrackFilter} filter The search parameters for the tracks
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {TrackSortFieldEnum} [sortField] The field by which to sort the tracks
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the tracks
   * @returns {Promise<ListResult<LibraryTrackDto>>} The list of tracks with their albums and track details.
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
   * Rates the specified tracks for the given account.  If a rating value of `0` is specified then the
   * rating is reset to `NULL`.
   * @param {number} accountId The ID of the account performing the rating
   * @param {number[]} trackIds The IDs of the files (tracks) to be rated
   * @param {RatingOrUnset} rating The rating value `0` `1` `2` `3` `4` `5` to be applied to the specified tracks
   * @throws {NotFoundException} If one or more of the specified tracks are not found
   */
  async rateTracks(accountId: number, trackIds: number[], rating: RatingOrUnset): Promise<void> {
    const tracks = await this.trackEntity.findAll({
      where: {
        accountId,
        id: trackIds,
      },
    });
    if (tracks.length !== trackIds.length) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }
    const newValue: Rating | null = rating > 0 ? (rating as Rating) : null;
    await this.trackEntity.update(
      {
        rating: newValue,
      },
      {
        where: {
          accountId,
          id: trackIds,
        },
      },
    );
  }

  /**
   * Retrieves one or more albums along with their associated tracks.
   * @param {number} accountId The ID of the account to filter by
   * @param {number | number[]} albumIds The IDs of the albums to retrieve
   * @throws {NotFoundException} If one or more of the specified albums are not found
   * @returns {Promise<LibraryAlbumWithTracksDto[]>} An array of one or more albums
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
    if (!albums || albums.length === 0) {
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
   * @param {number} accountId The ID of the account to filter by
   * @param {number | number[]} associationIds The IDs of the associations to retrieve
   * @param {AssociationTypeEnum} associationType The type of association (artist, composer, or genre)
   * @throws {NotFoundException} If one or more of the specified associations are not found
   * @returns {Promise<LibraryAssociationWithTracksDto[]>} An array of associations with their associated albums
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
      new Set(associations.map((association) => association.associationLinks.map((link) => link.albumId || 0)).flat()),
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
   * @param {number} accountId The ID of the account to filter by
   * @param {number | number[]} associationIds The IDs of the associations to retrieve
   * @param {AssociationTypeEnum} associationType The type of association (artist, composer, or genre)
   * @throws {NotFoundException} If one or more of the specified associations are not found
   * @returns {Promise<LibraryAssociationWithTracksDto[]>} An array of associations
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
    const trackIds = associations.flatMap((a) => a.associationLinks.map((link) => link.trackId));
    const tracks = await this.retrieveTrack(accountId, trackIds);
    const albumIds = Array.from(new Set(tracks.map((track) => track.albumId)));
    const albums = await this.retrieveAlbum(accountId, albumIds);
    return associations.map((association) => {
      const builtAssociation = this.transformerService.convertAssociationEntityToLibraryAssociation(association);
      const associationTrackIds = Array.from(new Set(association.associationLinks.map((link) => link.trackId)));
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
   * @param {number} accountId The ID of the account to filter by
   * @param {number | number[]} trackIds The IDs of the tracks to retrieve
   * @throws {NotFoundException} If one or more of the specified tracks are not found
   * @returns {Promise<LibraryTrackDto[]>} An array of tracks
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
    if (!tracks || tracks.length === 0) {
      throw new NotFoundException(ErrorCodes.TRACKS_NOT_FOUND_ERROR);
    }
    return tracks.map(this.transformerService.convertTrackEntityToLibraryTrack);
  }

  /**
   * Sets an album as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {number} albumId The ID of the album to set as favorite
   * @throws {NotFoundException} If the specified album is not found
   * @returns {Promise<void>} A promise that resolves when the operation is complete
   */
  async setAlbumFavorite(accountId: number, albumId: number): Promise<void> {
    const album = await this.albumEntity.findOne({
      attributes: ['id'],
      where: {
        id: albumId,
        accountId,
      },
    });
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    await this.favoriteItemEntity.create({
      accountId,
      albumId,
    } as FavoriteItemEntity);
  }

  /**
   * Sets an association as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {number} associationId The ID of the association to set as favorite
   * @param {AssociationTypeEnum} associationType The type of the association
   * @throws {NotFoundException} If the specified association is not found
   * @returns {Promise<void>} A promise that resolves when the operation is complete
   */
  async setAssociationFavorite(
    accountId: number,
    associationId: number,
    associationType: AssociationTypeEnum,
  ): Promise<void> {
    const association = await this.associationEntity.findOne({
      attributes: ['id'],
      where: {
        id: associationId,
        accountId,
      },
    });
    if (!association) {
      throw new NotFoundException(ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR);
    }
    await this.favoriteItemEntity.create({
      accountId,
      associationId,
      associationType,
    } as FavoriteItemEntity);
  }

  /**
   * Sets a folder as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {string} folderPath The full path of the folder relative to root dir, eg `/Elvis Presley`
   * @throws {NotFoundException} If the specified folder is not found
   * @returns {Promise<void>} A promise that resolves when the operation is complete
   */
  async setFolderFavorite(accountId: number, folderPath: string): Promise<void> {
    const folderStructure = await this.listFolders(accountId);
    const folderExists = folderStructure.some((item) => item.children?.some((child) => child.fullPath === folderPath));
    if (!folderExists) {
      throw new NotFoundException(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    }
    await this.favoriteItemEntity.create({
      accountId,
      folderPath,
    } as FavoriteItemEntity);
  }

  /**
   * Sets a track as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {number} trackId The ID of the track to set as favorite
   * @throws {NotFoundException} If the specified track is not found
   * @returns {Promise<void>} A promise that resolves when the operation is complete
   */
  async setTrackFavorite(accountId: number, trackId: number): Promise<void> {
    const track = await this.trackEntity.findOne({
      attributes: ['id'],
      where: {
        id: trackId,
        accountId,
      },
    });
    if (!track) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }
    await this.favoriteItemEntity.create({
      accountId,
      trackId,
    } as FavoriteItemEntity);
  }
}
