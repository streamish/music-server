import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserSetAlbumFavoriteService {
  constructor(private readonly libraryService: LibraryService) {}

  async setAlbumFavorite(accountId: number, albumId: number): Promise<void> {
    await this.libraryService.setAlbumFavorite(accountId, albumId);
  }
}
