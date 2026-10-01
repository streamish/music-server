import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserRetrieveAlbumService {
  constructor(private readonly libraryService: LibraryService) {}

  async retrieveAlbum(accountId: number, albumId: number) {
    const albums = await this.libraryService.retrieveAlbum(accountId, albumId);
    const album = albums[0];
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    return album;
  }
}
