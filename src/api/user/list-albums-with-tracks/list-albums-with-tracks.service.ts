import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumsWithTracksQueryDto } from './list-albums-with-tracks.dto';

@Injectable()
export class UserListAlbumsWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAlbumsWithTracks(accountId: number, query: UserListAlbumsWithTracksQueryDto) {
    const data = await this.libraryService.listAlbums(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    const albums = await this.libraryService.retrieveAlbum(
      accountId,
      data.items.map((album) => album.id),
    );
    return {
      albums,
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
