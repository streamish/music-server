import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TrackEntity } from 'src/database/entities';
import type { Rating, RatingOrUnset } from 'src/types';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  /**
   * Rates the specified tracks for the given account.  If a rating value of `0` is specified then the
   * rating is reset to `NULL`.
   * @param accountId The media owner account ID
   * @param trackIds The IDs of the files (tracks) to be rated
   * @param rating The rating value `0` `1` `2` `3` `4` `5` to be applied to the specified tracks
   * @throws If any specified track is not found
   */
  async rateTracks(accountId: number, trackIds: number[], rating: RatingOrUnset) {
    const tracks = await this.trackEntity.findAll({
      where: {
        accountId,
        id: trackIds,
      },
    });
    if (tracks.length !== trackIds.length) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }
    const newValue: Rating | null = rating > 0 ? (rating as Rating) : null;
    await this.trackEntity.update(
      {
        rating: newValue,
      },
      {
        where: {
          accountId,
          id: trackIds,
        },
      },
    );
  }
}
