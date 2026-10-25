import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicErrorCode, SubsonicException } from './subsonic-error';
import { libraryAlbumToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicAlbumService {
  constructor(private readonly libraryService: LibraryService) {}

  async getAlbum(userId: number, albumId: number) {
    const albums = await this.libraryService.retrieveAlbum(userId, albumId);
    if (!albums || !albums?.[0]) {
      throw new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
    }
    const album = albums[0];
    const tracks = await this.libraryService.listTracks(userId, { albumIds: [albumId] }, 0, 500);
    return libraryAlbumToRow({ ...album, tracks: tracks.items });
  }
}
