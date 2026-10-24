import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicTopSongsQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicTopSongsService {
  constructor(private readonly libraryService: LibraryService) {}

  // Play counts are not tracked, so this returns the artist's tracks.
  async getTopSongs(userId: number, query: SubsonicTopSongsQueryDto) {
    const tracks = await this.libraryService.listTracks(userId, { artist: [query.artist] }, 0, query.count ?? 50);
    return { song: tracks.items.map(libraryTrackToRow) };
  }
}
