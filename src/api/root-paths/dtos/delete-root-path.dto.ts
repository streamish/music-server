import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class DeleteRootPathQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR) {}
