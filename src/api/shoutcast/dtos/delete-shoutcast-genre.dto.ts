import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class DeleteShoutcastGenreQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_SHOUTCAST_GENRE_ID_ERROR) {}
