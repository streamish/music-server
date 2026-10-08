/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminDeleteRootPathQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR) {}

export class AdminDeleteRootPathResponseDto extends SuccessResponseDto {}
