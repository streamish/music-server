import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserSetFolderFavoriteService {
  constructor(private readonly libraryService: LibraryService) {}

  async setFolderFavorite(accountId: number, folder: string) {
    return this.libraryService.setFolderFavorite(accountId, folder);
  }
}
