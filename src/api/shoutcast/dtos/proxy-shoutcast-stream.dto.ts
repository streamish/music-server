import { ErrorCodes } from 'src/constants/error-codes';
import { IsUrl, Length } from 'class-validator';

export class ProxyShoutcastStreamQueryDto {
  /**
   * The URL of the Shoutcast station if it is an online station that has not
   * previously been added as a custom station.
   */
  @IsUrl({ protocols: ['http', 'https'] }, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR })
  declare shoutcastStationUrl: string;
}
