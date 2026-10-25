/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicInternetRadioStationsDataDto {}

export class SubsonicInternetRadioStationsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicInternetRadioStationsDataDto })
  declare internetRadioStations: SubsonicInternetRadioStationsDataDto;
}
