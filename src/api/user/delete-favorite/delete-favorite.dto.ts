/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserDeleteFavoriteQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR) {}

export class UserDeleteFavoriteResponseDto extends SuccessResponseDto {}
