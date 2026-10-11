import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { RatingOrUnset } from 'src/types';

@Injectable()
export class ApiRatingsService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Assigns or clears a rating on an album.  If a value of 0 is set the rating is
   * reset to NULL.  Album ratings are applied to each track individually within the
   * album, overriding any track-specific rating that was previously set.
   * @param {number} accountId The authenticated account ID
   * @param {number} albumId The album to apply the rating to
   * @param {RatingOrUnset} rating Integer value `0`-`5` where `0` is reset flag
   * @throws {NotFoundException} If the specified album is not found
   */
  async setAlbumRating(accountId: number, albumId: number, rating: RatingOrUnset) {
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

  /**
   * Assigns or clears a rating on a track.  If a value of 0 is set the rating is
   * reset to NULL.
   * @param {number} accountId The authenticated account ID
   * @param {number} trackId The track to apply the rating to
   * @param {RatingOrUnset} rating Integer value `0`-`5` where `0` is reset flag
   * @throws {NotFoundException} If the specified track is not found
   */
  async setTrackRating(accountId: number, trackId: number, rating: RatingOrUnset) {
    await this.libraryService.rateTracks(accountId, [trackId], rating);
  }
}
