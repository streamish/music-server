import { Injectable } from '@nestjs/common';
import { LibraryAssociationDto } from 'src/library/dtos/library.association.dto';
import { LibraryService } from 'src/library/library.service';
import { SynologyDefaultGenreDataDto, SynologyGenreDataDto, SynologyGenreDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

const defaultGenres = [
  'Ballad',
  'Blues/Soul',
  'Classical',
  'Country',
  'EDM/Dance',
  'Funk',
  'Hip-Hop/R&B',
  'Jazz',
  'Pop',
  'Reggae',
  'Rock/Metal',
  'Soundtrack',
  'World/Spiritual',
];

function genreToRow(association: LibraryAssociationDto): SynologyGenreDto {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `genre_${association.id}`,
    name: replaceDoubleQuotes(association.name),
  };
}

@Injectable()
export class SynologyGenreService {
  constructor(private readonly libraryService: LibraryService) {}

  // eslint-disable-next-line class-methods-use-this
  async listDefaultGenres(): Promise<SynologyDefaultGenreDataDto> {
    return {
      default_genres: defaultGenres.map((name) => ({ name })),
      total: defaultGenres.length,
    };
  }

  async listGenres(accountId: number, offset: number, limit: number): Promise<SynologyGenreDataDto> {
    const genres = await this.libraryService.listTrackAssociations(
      accountId,
      {
        isGenre: true,
      },
      offset,
      limit || 100000,
    );
    return {
      genres: genres.items.map(genreToRow),
      offset,
      total: genres.total,
    };
  }
}
