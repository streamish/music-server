/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsInt, Max, Min } from 'class-validator';
import type { RatingOrUnset } from 'src/types';

export class SetAlbumRatingQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {}

export class SetAlbumRatingBodyDto {
  /**
   * The rating value to be set for the track.  If it is 0 the rating will be unset.
   */
  @ApiProperty({
    type: 'integer',
    default: 0,
    minimum: 0,
    maximum: 5,
    enum: [0, 1, 2, 3, 4, 5],
    enumName: 'RatingOrUnset',
  })
  @IsInt({ message: ErrorCodes.INVALID_RATING_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_MIN_RATING_ERROR })
  @Max(5, { message: ErrorCodes.INVALID_MAX_RATING_ERROR })
  declare rating: RatingOrUnset;
}
