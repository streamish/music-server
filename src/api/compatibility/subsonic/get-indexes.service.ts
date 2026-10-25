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
    const index: Record<string, ReturnType<typeof libraryAssociationToRow>[]> = {};
    for (let i = 0, len = artists.items.length; i < len; i += 1) {
      const artist = artists.items[i];
      if (artist) {
        const firstLetter = artist.name.charAt(0).toUpperCase();
        if (firstLetter) {
          const object = libraryAssociationToRow(artist);
          const array = index[firstLetter];
          if (!array) {
            index[firstLetter] = [object];
          } else {
            array.push(object);
          }
        }
      }
    }
    return index;
  }
}
