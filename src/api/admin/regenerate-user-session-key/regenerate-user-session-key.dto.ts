/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminRegenerateUserSessionKeyQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class AdminRegenerateUserSessionKeyResponseDto extends SuccessResponseDto {}
