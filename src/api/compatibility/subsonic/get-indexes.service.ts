import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { libraryAssociationToRow } from './subsonic.mapper';

@Injectable()
export class SubsonicIndexesService {
  constructor(private readonly libraryService: LibraryService) {}

  async getIndexes(userId: number, rootPathId?: number) {
    const artists = await this.libraryService.listAlbumAssociations(
      userId,
      {
        rootPathId,
      },
      0,
      100_000,
    );
    const index = {};
    for (let i = 0, len = artists.items.length; i < len; i += 1) {
      const artist = artists.items[i];
      if (artist) {
        const firstLetter = artist.name.charAt(0).toUpperCase();
        if (!index[firstLetter]) {
          index[firstLetter] = [];
        }
        index[firstLetter].push(libraryAssociationToRow(artist));
      }
    }
    return index;
  }
}
