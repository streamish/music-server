/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateShoutcastStationQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_SHOUTCAST_STATION_ID_ERROR) {}

export class UpdateShoutcastStationBodyDto {
  @IsUrl({ protocols: ['http', 'https'] }, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR })
  declare url: string;

  @IsString({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_ERROR })
  declare title: string;
}
