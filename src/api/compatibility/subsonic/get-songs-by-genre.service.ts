import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicSongsByGenreQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicSongsByGenreService {
  constructor(private readonly libraryService: LibraryService) {}

  async getSongsByGenre(userId: number, query: SubsonicSongsByGenreQueryDto) {
    const tracks = await this.libraryService.listTracks(
      userId,
      { genre: [query.genre] },
      query.offset ?? 0,
      Math.min(query.count ?? 10, 500),
    );
    return { song: tracks.items.map(libraryTrackToRow) };
  }
}
