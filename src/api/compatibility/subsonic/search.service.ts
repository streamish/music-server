import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicSearchQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicSearchService {
  constructor(private readonly libraryService: LibraryService) {}

  async search(userId: number, query: SubsonicSearchQueryDto) {
    const filter = query.any ?? query.title ?? query.album ?? query.artist;
    const count = query.count ?? 20;
    const offset = query.offset ?? 0;
    const tracks = await this.libraryService.listTracks(userId, { filter }, offset, count);
    return {
      offset,
      totalHits: tracks.total,
      match: tracks.items.map(libraryTrackToRow),
    };
  }
}
