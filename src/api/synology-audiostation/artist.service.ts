import { Injectable } from '@nestjs/common';
import { LibraryAssociationDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { SynologyArtistDataDto, SynologyArtistDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

function personToRow(person: LibraryAssociationDto): SynologyArtistDto {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `artist_${person.id}`,
    name: replaceDoubleQuotes(person.name),
  };
}
@Injectable()
export class SynologyArtistService {
  constructor(private readonly libraryService: LibraryService) {}

  async listArtists(accountId: number, offset: number, limit: number): Promise<SynologyArtistDataDto> {
    const artists = await this.libraryService.listAlbumAssociations(accountId, { isArtist: true }, offset, limit);
    return {
      artists: artists.items.map(personToRow),
      offset,
      total: artists.total,
    };
  }

  async listArtistsByGenre(
    accountId: number,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyArtistDataDto> {
    const artists = await this.libraryService.listAlbumAssociations(
      accountId,
      {
        genre: genreName.split('/'),
        isArtist: true,
      },
      offset,
      limit,
    );
    return {
      artists: artists.items.map(personToRow),
      offset,
      total: artists.total,
    };
  }
}
