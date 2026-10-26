import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SortDirectionEnum, TrackSortFieldEnum } from 'src/types/enums';
import { SubsonicTopSongsQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicTopSongsService {
  constructor(private readonly libraryService: LibraryService) {}

  // Returns the artist's most played tracks.
  async getTopSongs(userId: number, query: SubsonicTopSongsQueryDto) {
    const tracks = await this.libraryService.listTracks(
      userId,
      { artist: [query.artist] },
      0,
      query.count ?? 50,
      TrackSortFieldEnum.PLAY_COUNT,
      SortDirectionEnum.DESC,
    );
    return { song: tracks.items.map(libraryTrackToRow) };
  }
}
