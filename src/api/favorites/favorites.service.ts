import { AssociationTypeEnum } from 'src/types/enums';
import { FavoritesService } from 'src/favorites/favorites.service';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { ListFavoritesQueryDto, ListFavoritesResponseDto } from './dtos';

@Injectable()
export class ApiFavoritesService {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly libraryService: LibraryService,
  ) {}

  /**
   * Deletes the specified favorite.
   * @param userId The authenticated user ID
   * @param favoriteItemId The ID of the favorite to delete
   * @throws If the specified favorite is not found
   */
  async deleteFavorite(userId: number, favoriteItemId: number) {
    return this.favoritesService.deleteFavoriteItem(userId, favoriteItemId);
  }

  /**
   * Returns paginated list of favorites for the account.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of albums
   */
  async listFavorites(userId: number, query: ListFavoritesQueryDto) {
    const favorites = await this.libraryService.listFavorites(userId, query.offset || 0, query.limit || 100_000);
    return {
      favorites: favorites.items,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: favorites.total,
    } as unknown as ListFavoritesResponseDto;
  }

  /**
   * Sets a folder as a favorite for the specified account.
   * @param userId The authenticated user ID
   * @param albumId The ID of the album to add to favorites
   * @throws If the specified album is not found
   */
  async setAlbumFavorite(userId: number, albumId: number) {
    return this.favoritesService.setAlbumFavorite(userId, albumId);
  }

  /**
   * Sets a folder as a favorite for the specified account.
   * @param userId The authenticated user ID
   * @param albumId The ID of the album to add to favorites
   * @throws If the specified album is not found
   */
  async setAssociationFavorite(userId: number, associationId: number, associationType: AssociationTypeEnum) {
    return this.favoritesService.setAssociationFavorite(userId, associationId, associationType);
  }

  /**
   * Sets an album as a favorite for the specified account.
   * @param userId The authenticated user ID
   * @param folderPath The full path of the folder relative to root dir, eg `/Elvis Presley`
   * @throws If the specified folder is not found
   */
  async setFolderFavorite(userId: number, folder: string) {
    return this.favoritesService.setFolderFavorite(userId, folder);
  }

  /**
   * Sets a shoutcast station as a favorite for the specified account.
   * @param userId The authenticated user ID
   * @param [stationId] The ID of the shoutcast station to add to favorites
   * @param [stationUrl] The URL of the shoutcast station to add to favorites
   * @param [stationTitle] The title of the shoutcast station to add to favorites
   * @throws If the specified shoutcast station is not found
   */
  async setShoutcastStationFavorite(userId: number, stationId?: number, stationUrl?: string, stationTitle?: string) {
    return this.favoritesService.setShoutcastStationFavorite(userId, stationId, stationUrl, stationTitle);
  }

  /**
   * Sets a track as a favorite for the specified account.
   * @param userId The authenticated user ID
   * @param trackId The ID of the track to add to favorites
   * @throws If the specified track is not found
   */
  async setTrackFavorite(userId: number, trackId: number) {
    return this.favoritesService.setTrackFavorite(userId, trackId);
  }
}
