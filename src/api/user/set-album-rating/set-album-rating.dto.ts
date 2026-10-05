/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, Max, Min } from 'class-validator';
import type { RatingOrUnset } from 'src/types';

export class UserSetAlbumRatingQueryDto {
  /**
   * The ID of an album to rate, which will apply the rating to all tracks within it.
   */
  @IsInt({ message: ErrorCodes.INVALID_ALBUM_ID_ERROR })
  declare id: number;
}

export class UserSetAlbumRatingBodyDto {
  /**
   * The rating value to be set for the track.  If it is 0 the rating will be unset.
   */
  @ApiProperty({
    type: 'number',
    format: 'int32',
    minimum: 0,
    maximum: 5,
  })
  @IsInt({ message: ErrorCodes.INVALID_RATING_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_MIN_RATING_ERROR })
  @Max(5, { message: ErrorCodes.INVALID_MAX_RATING_ERROR })
  declare rating: RatingOrUnset;
}

export class UserSetAlbumRatingResponseDto extends SuccessResponseDto {}

export class UserSetAlbumRatingNotFoundResponseDto extends NotFoundResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
    enumName: 'UserSetAlbumRatingNotFoundErrorMessage',
    default: ErrorCodes.ALBUM_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class UserSetAlbumRatingBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ALBUM_ID_ERROR,
      ErrorCodes.INVALID_RATING_ERROR,
      ErrorCodes.INVALID_MIN_RATING_ERROR,
      ErrorCodes.INVALID_MAX_RATING_ERROR,
    ],
    enumName: 'UserSetAlbumRatingBadRequestErrorMessage',
    default: ErrorCodes.INVALID_RATING_ERROR,
  })
  declare message: ErrorCodes[];
}
