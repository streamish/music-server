/* eslint-disable max-classes-per-file */
import { ErrorCodes } from 'src/constants/error-codes';
import { IsBoolean, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { ShoutcastStationDto } from 'src/shoutcast/dtos/shoutcast-station.dto';
import { createItemResponseDto } from 'src/api/response.dto';

export class CreateShoutcastStationBodyDto {
  /**
   * The URL of the station, which must be a valid HTTP or HTTPS URL.
   */
  @IsUrl({ protocols: ['http', 'https'] }, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR })
  declare url: string;

  /**
   * The title of the SHOUTcast station that will appear in your stations list.
   */
  @IsString({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_ERROR })
  @IsNotEmpty({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR })
  declare title: string;

  /**
   * Flag to mark the SHOUTcast station as a favorite.
   */
  @IsBoolean({ message: ErrorCodes.INVALID_SHOUTCAST_STATION_FAVORITE_ERROR })
  declare favorite: boolean;
}

export class CreateShoutcastStationResponseDto extends createItemResponseDto('station', ShoutcastStationDto) {}
