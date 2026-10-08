/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { NotFoundResponseDtoFactory, SuccessResponseDto } from 'src/api/response.dto';

export class UserDeleteCustomDataQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_TRACK_ID_ERROR) {}

export class UserDeleteCustomDataResponseDto extends SuccessResponseDto {}

export class UserDeleteCustomDataNotFoundResponseDto extends NotFoundResponseDtoFactory('', '', [
  ErrorCodes.FILE_NOT_FOUND_ERROR,
]) {}
