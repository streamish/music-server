import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserDeleteFavoriteService {
  constructor(private readonly libraryService: LibraryService) {}

  async deleteFavorite(accountId: number, favoriteItemId: number) {
    return this.libraryService.deleteFavoriteItem(accountId, favoriteItemId);
  }
}
