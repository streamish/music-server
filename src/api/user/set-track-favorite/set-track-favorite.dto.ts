/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserSetTrackFavoriteQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_TRACK_ID_ERROR) {}

export class UserSetTrackFavoriteResponseDto extends SuccessResponseDto {}
