import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsOptional, IsUrl, Length, Min, ValidateIf } from 'class-validator';

export class SetShoutcastStationFavoriteQueryDto {
  /**
   * The ID of a previously-added custom station.  This will take precedence
   * if a URL has also been supplied.
   */
  @IsInt({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_ID_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_ID_ERROR })
  @IsOptional()
  @ValidateIf((object) => object.shoutcastStationUrl === undefined || object.shoutcastStationId !== undefined)
  shoutcastStationId?: number;

  /**
   * The title of the Shoutcast station if it is an online station that has not
   * previously been added as a custom station.
   */
  @IsOptional()
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR })
  shoutcastStationTitle?: string;

  /**
   * The URL of the Shoutcast station if it is an online station that has not
   * previously been added as a custom station.
   */
  @IsUrl({ protocols: ['http', 'https'] }, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR })
  @IsOptional()
  @ValidateIf((object) => object.shoutcastStationId === undefined || object.shoutcastStationUrl !== undefined)
  shoutcastStationUrl?: string;
}
