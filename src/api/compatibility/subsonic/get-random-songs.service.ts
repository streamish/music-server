import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicRandomSongsQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicRandomSongsService {
  constructor(private readonly libraryService: LibraryService) {}

  async getRandomSongs(userId: number, query: SubsonicRandomSongsQueryDto) {
    const tracks = await this.libraryService.listTracks(
      userId,
      { genre: query.genre ? [query.genre] : undefined },
      0,
      query.size || 100_000,
    );
    return tracks.items
      .filter(
        (track) => (!query.fromYear || track.year >= query.fromYear) && (!query.toYear || track.year <= query.toYear),
      )
      .sort(() => Math.random() - 0.5)
      .map(libraryTrackToRow);
  }
}
