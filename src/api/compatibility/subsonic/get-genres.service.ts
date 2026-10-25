import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class SubsonicGenresService {
  constructor(private readonly libraryService: LibraryService) {}

  async getGenres(userId: number) {
    const genres = await this.libraryService.listTrackAssociations(userId, { isGenre: true }, 0, 100_000);
    return { genre: genres.items.map((genre) => ({ value: genre.name })) };
  }
}
