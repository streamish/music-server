/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { NotFoundResponseDtoFactory, SuccessResponseDto } from 'src/api/response.dto';

export class TestDeleteAccountQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class TestDeleteAccountResponseDto extends SuccessResponseDto {}

export class TestDeleteAccountNotFoundResponseDto extends NotFoundResponseDtoFactory('', '', [
  ErrorCodes.INTERNAL_SERVER_ERROR,
  ErrorCodes.NOT_FOUND_ERROR,
]) {}
