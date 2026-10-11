import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { ListFavoritesQueryDto } from './dtos';

@Injectable()
export class ApiFavoritesService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Deletes the specified favorite.
   * @param {number} accountId The ID of the authenticated account
   * @param {number} favoriteItemId The ID of the favorite to delete
   * @throws {NotFoundException} If the specified favorite is not found
   */
  async deleteFavorite(accountId: number, favoriteItemId: number) {
    return this.libraryService.deleteFavoriteItem(accountId, favoriteItemId);
  }

  /**
   * Returns paginated list of favorites for the account.
   * @param {number} accountId The authenticated user
   * @param {ListAlbumsQueryDto} query Optional query filters
   * @returns {ListFavoritesResponseDto} Paginated dataset of albums
   */
  async listFavorites(accountId: number, query: ListFavoritesQueryDto) {
    const favorites = await this.libraryService.listFavorites(accountId, query.offset || 0, query.limit || 100_000);
    return {
      favorites: favorites.items,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: favorites.total,
    };
  }

  /**
   * Sets a folder as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {number} albumId The ID of the album to add to favorites
   * @throws {NotFoundException} If the specified album is not found
   */
  async setAlbumFavorite(accountId: number, albumId: number): Promise<void> {
    await this.libraryService.setAlbumFavorite(accountId, albumId);
  }

  /**
   * Sets a folder as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {number} albumId The ID of the album to add to favorites
   * @throws {NotFoundException} If the specified album is not found
   */
  async setAssociationFavorite(
    accountId: number,
    associationId: number,
    associationType: AssociationTypeEnum,
  ): Promise<void> {
    await this.libraryService.setAssociationFavorite(accountId, associationId, associationType);
  }

  /**
   * Sets an album as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {string} folderPath The full path of the folder relative to root dir, eg `/Elvis Presley`
   * @throws {NotFoundException} If the specified folder is not found
   */
  async setFolderFavorite(accountId: number, folder: string) {
    return this.libraryService.setFolderFavorite(accountId, folder);
  }

  /**
   * Sets a track as a favorite for the specified account.
   * @param {number} accountId The ID of the account
   * @param {number} trackId The ID of the track to add to favorites
   * @throws {NotFoundException} If the specified track is not found
   */
  async setTrackFavorite(accountId: number, trackId: number): Promise<void> {
    await this.libraryService.setTrackFavorite(accountId, trackId);
  }
}
