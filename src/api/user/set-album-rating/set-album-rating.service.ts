import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { RatingOrUnset } from 'src/types/rating';

@Injectable()
export class UserSetAlbumRatingService {
  constructor(private readonly libraryService: LibraryService) {}

  async setRating(accountId: number, albumId: number, rating: RatingOrUnset) {
    const trackIds: number[] = [];
    const album = await this.libraryService.retrieveAlbum(accountId, albumId);
    if (album && album.length > 0) {
      trackIds.push(...(album[0]?.tracks.map((track) => track.id) || []));
    }
    if (!trackIds.length) {
      throw new NotFoundException(ErrorCodes.TRACKS_NOT_FOUND_ERROR);
    }
    await this.libraryService.rateTracks(accountId, trackIds, rating);
  }
}
