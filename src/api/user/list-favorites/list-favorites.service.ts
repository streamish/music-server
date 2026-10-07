import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListFavoritesQueryDto } from './list-favorites.dto';

@Injectable()
export class UserListFavoritesService {
  constructor(private readonly libraryService: LibraryService) {}

  async listFavorites(accountId: number, query: UserListFavoritesQueryDto) {
    const favorites = await this.libraryService.listFavorites(accountId, query.offset || 0, query.limit || 10);
    return {
      favorites: favorites.items,
      offset: query.offset || 0,
      total: favorites.total,
    };
  }
}
