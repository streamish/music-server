import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { RatingOrUnset } from 'src/types';
import { RatingsService } from 'src/ratings/ratings.service';

@Injectable()
export class ApiRatingsService {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly ratingsService: RatingsService,
  ) {}

  /**
   * Assigns or clears a rating on an album.  If a value of 0 is set the rating is
   * reset to NULL.  Album ratings are applied to each track individually within the
   * album, overriding any track-specific rating that was previously set.
   * @param userId The authenticated user ID
   * @param albumId The album to apply the rating to
   * @param rating Integer value `0`-`5` where `0` is reset flag
   * @throws If the specified album is not found
   * @throws If the album tracks are not found
   */
  async setAlbumRating(userId: number, albumId: number, rating: RatingOrUnset) {
    const trackIds: number[] = [];
    const album = await this.libraryService.retrieveAlbum(userId, albumId);
    if (album?.length < 1) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    if (album && album.length > 0) {
      trackIds.push(...(album[0]?.tracks.map((track) => track.id) || []));
    }
    if (!trackIds.length) {
      throw new NotFoundException(ErrorCodes.TRACKS_NOT_FOUND_ERROR);
    }
    await this.ratingsService.rateTracks(userId, trackIds, rating);
  }

  /**
   * Assigns or clears a rating on a track.  If a value of 0 is set the rating is
   * reset to NULL.
   * @param userId The authenticated user ID
   * @param trackId The track to apply the rating to
   * @param rating Integer value `0`-`5` where `0` is reset flag
   * @throws If the specified track is not found
   */
  async setTrackRating(userId: number, trackId: number, rating: RatingOrUnset) {
    await this.ratingsService.rateTracks(userId, [trackId], rating);
  }
}
