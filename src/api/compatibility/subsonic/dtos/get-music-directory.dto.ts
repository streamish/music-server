import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class SubsonicMusicDirectoryQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_FOLDER_ID_ERROR) {}
