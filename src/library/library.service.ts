import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
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
import { LibraryFolderDto, LibraryTrackDto } from './dtos';
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
   * Lists all folders for a given account in a tree structure.
   * @param accountId The media owner account ID
   * @returns The tree structure of folders for the account
   */
  async listFolders(accountId: number): Promise<LibraryFolderDto[]> {
    const tracks = await this.listTracks(accountId, {}, 0, 100_000);
    const favorites = await this.favoriteItemEntity.findAll({
      attributes: ['id', 'folderPath'],
      where: {
        accountId,
        folderPath: {
          [Op.not]: null,
        },
      },
    });
    const favoriteIndex: Record<string, number> = {};
    for (let i = 0, len = favorites.length; i < len; i += 1) {
      const favorite = favorites[i];
      if (favorite?.folderPath) {
        favoriteIndex[favorite.folderPath] = favorite.id;
      }
    }
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
                favoriteId: favoriteIndex[currentPath] || undefined,
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
   * Rates the specified tracks for the given account.  If a rating value of `0` is specified then the
   * rating is reset to `NULL`.
   * @param accountId The media owner account ID
   * @param trackIds The IDs of the files (tracks) to be rated
   * @param rating The rating value `0` `1` `2` `3` `4` `5` to be applied to the specified tracks
   * @throws If any specified track is not found
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
