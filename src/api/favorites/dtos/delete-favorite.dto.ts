import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class DeleteFavoriteQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR) {}
