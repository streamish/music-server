/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { ShoutcastStationDto } from 'src/shoutcast/dtos/shoutcast-station.dto';
import { createArrayResponseDto } from 'src/api/response.dto';

export class ListOnlineShoutcastStationsQueryDto extends IdQueryDtoFactory(
  ErrorCodes.INVALID_SHOUTCAST_GENRE_ID_ERROR,
) {}

export class ListOnlineShoutcastStationsResponseDto extends createArrayResponseDto('stations', ShoutcastStationDto) {}
