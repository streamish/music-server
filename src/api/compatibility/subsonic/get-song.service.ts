import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicErrorCode, SubsonicException } from './subsonic-error';
import { SubsonicSongQueryDto } from './dtos';
import { libraryTrackToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicSongService {
  constructor(private readonly libraryService: LibraryService) {}

  async getSong(userId: number, query: SubsonicSongQueryDto) {
    const tracks = await this.libraryService.retrieveTrack(userId, query.id);
    if (!tracks?.[0]) {
      throw new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
    }
    return libraryTrackToRow(tracks[0]);
  }
}
