/* eslint-disable max-classes-per-file */
import { AdminAuthorizationBodyDto, IdQueryDtoFactory } from 'src/api/request.dto';
import { ErrorCodes } from 'src/constants/error-codes';

export class DeleteAccountQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ACCOUNT_ID_ERROR) {}

export class DeleteAccountBodyDto extends AdminAuthorizationBodyDto {}
