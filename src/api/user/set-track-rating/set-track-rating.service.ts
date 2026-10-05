import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { RatingOrUnset } from 'src/types/rating';

@Injectable()
export class UserSetTrackRatingService {
  constructor(private readonly libraryService: LibraryService) {}

  async setRating(accountId: number, trackId: number, rating: RatingOrUnset) {
    await this.libraryService.rateTracks(accountId, [trackId], rating);
  }
}
