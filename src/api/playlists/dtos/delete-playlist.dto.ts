import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class DeletePlaylistQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_PLAYLIST_ID_ERROR) {}
