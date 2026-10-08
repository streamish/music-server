/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponseDto, NotFoundResponseDtoFactory, SuccessResponseDto } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsInt, Max, Min } from 'class-validator';
import type { RatingOrUnset } from 'src/types';

export class UserSetTrackRatingQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_TRACK_ID_ERROR) {}

export class UserSetTrackRatingBodyDto {
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

export class UserSetTrackRatingResponseDto extends SuccessResponseDto {}

export class UserSetTrackRatingNotFoundResponseDto extends NotFoundResponseDtoFactory('', '', [
  ErrorCodes.TRACK_NOT_FOUND_ERROR,
  ErrorCodes.ALBUM_NOT_FOUND_ERROR,
]) {}

export class UserSetTrackRatingBadRequestResponseDto extends BadRequestResponseDto {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_TRACK_ID_ERROR,
      ErrorCodes.INVALID_ALBUM_ID_ERROR,
      ErrorCodes.INVALID_RATING_ERROR,
      ErrorCodes.INVALID_MIN_RATING_ERROR,
      ErrorCodes.INVALID_MAX_RATING_ERROR,
    ],
    enumName: 'UserSetTrackRatingBadRequestErrorMessage',
    default: ErrorCodes.INVALID_RATING_ERROR,
  })
  declare message: ErrorCodes[];
}
