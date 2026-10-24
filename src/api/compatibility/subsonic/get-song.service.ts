import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicSongQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicSongService {
  constructor(private readonly libraryService: LibraryService) {}

  async getSong(userId: number, query: SubsonicSongQueryDto) {
    const tracks = await this.libraryService.retrieveTrack(userId, query.id);
    if (!tracks?.[0]) {
      throw new NotFoundException(`Song not found: ${query.id}`);
    }
    return libraryTrackToRow(tracks[0]);
  }
}
