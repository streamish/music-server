import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAssociationDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';

function artistToRow(association: LibraryAssociationDto) {
  return {
    id: `artist-${association.id}`,
    name: association.name,
  };
}

@Injectable()
export class SubsonicGetIndexesService {
  constructor(private readonly library: LibraryService) {}

  async getIndexes(accountId: number, rootPathId?: number) {
    const artists = await this.library.listAlbumAssociations(
      accountId,
      {
        rootPathId,
      },
      0,
      100_000,
    );
    if (!artists || !artists?.[0]) {
      throw new NotFoundException(`Artist not found for rootPathId: ${rootPathId}`);
    }
    const index = {};
    for (let i = 0, len = artists.items.length; i < len; i += 1) {
      const artist = artists.items[i];
      if (artist) {
        const firstLetter = artist.name.charAt(0).toUpperCase();
        if (!index[firstLetter]) {
          index[firstLetter] = [];
        }
        index[firstLetter].push(artistToRow(artist));
      }
    }
    return index;
  }
}
