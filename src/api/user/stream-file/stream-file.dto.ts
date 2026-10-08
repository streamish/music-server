/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class UserStreamFileQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_TRACK_ID_ERROR) {}
