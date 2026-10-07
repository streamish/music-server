import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserSetTrackFavoriteService {
  constructor(private readonly libraryService: LibraryService) {}

  async setTrackFavorite(accountId: number, trackId: number): Promise<void> {
    await this.libraryService.setTrackFavorite(accountId, trackId);
  }
}
