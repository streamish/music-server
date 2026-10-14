import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';

export class DeleteShoutcastStationQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_SHOUTCAST_STATION_ID_ERROR) {}
