import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  PlaylistEntity,
  TrackEntity,
} from 'src/database/entities';
import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumWithTracksDto, LibraryFavoriteDto, LibraryFolderDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { LibraryTransformerService } from 'src/library/transformer.service';
import { ListResult } from 'src/library/types/list-result';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    @InjectModel(FavoriteItemEntity)
    private readonly favoriteItemEntity: typeof FavoriteItemEntity,
    private readonly libraryService: LibraryService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    private readonly transformerService: LibraryTransformerService,
  ) {}

  /**
   * Deletes the specified favorite item
   * @param accountId The ID of the account to delete the favorite item for
   * @param favoriteItemId The ID of the favorite item to delete
   * @throws If the favorite item is not found
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
   * Returns a list of favorites with related track, album, association, and playlist data, optionally paginated.
   * @param accountId The media owner account ID
   * @param offset Optional pagination offset
   * @param limit Optional pagination limit
   * @returns The favorite list and total record count.
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
      folders = await this.libraryService.listFolders(accountId);
    }
    return {
      total,
      items: await Promise.all(
        favorites.map(async (favorite) => {
          const albums: LibraryAlbumWithTracksDto[] = [];
          if (favorite.associationId && favorite.associationType) {
            const albumArtist =
              favorite.associationType === AssociationTypeEnum.ARTIST
                ? await this.libraryService.retrieveAlbumAssociation(
                    favorite.accountId,
                    favorite.associationId,
                    AssociationTypeEnum.ARTIST,
                  )
                : [];
            const trackAssociations = await this.libraryService.retrieveTrackAssociation(
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
   * Sets an album as a favorite for the specified account.
   * @param accountId The media owner account ID
   * @param albumId The ID of the album to set as favorite
   * @throws If the specified album is not found
   */
  async setAlbumFavorite(accountId: number, albumId: number): Promise<FavoriteItemEntity> {
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
    return this.favoriteItemEntity.create({
      accountId,
      albumId,
    } as FavoriteItemEntity);
  }

  /**
   * Sets an association as a favorite for the specified account.
   * @param accountId The media owner account ID
   * @param associationId The ID of the association to set as favorite
   * @param associationType The type of the association
   * @throws If the specified association is not found
   */
  async setAssociationFavorite(
    accountId: number,
    associationId: number,
    associationType: AssociationTypeEnum,
  ): Promise<FavoriteItemEntity> {
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
    return this.favoriteItemEntity.create({
      accountId,
      associationId,
      associationType,
    } as FavoriteItemEntity);
  }

  /**
   * Sets a folder as a favorite for the specified account.
   * @param accountId The media owner account ID
   * @param folderPath The full path of the folder relative to root dir, eg `/Elvis Presley`
   * @throws If the specified folder is not found
   */
  async setFolderFavorite(accountId: number, folderPath: string): Promise<FavoriteItemEntity> {
    const folderStructure = await this.libraryService.listFolders(accountId);
    const folderExists = folderStructure.some((item) => item.children?.some((child) => child.fullPath === folderPath));
    if (!folderExists) {
      throw new NotFoundException(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    }
    return this.favoriteItemEntity.create({
      accountId,
      folderPath,
    } as FavoriteItemEntity);
  }

  /**
   * Sets a track as a favorite for the specified account.
   * @param accountId The media owner account ID
   * @param trackId The ID of the track to set as favorite
   * @throws If the specified track is not found
   */
  async setTrackFavorite(accountId: number, trackId: number): Promise<FavoriteItemEntity> {
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
    return this.favoriteItemEntity.create({
      accountId,
      trackId,
    } as FavoriteItemEntity);
  }
}
