import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class SetAlbumFavoriteQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {}
