/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicInternetRadioStationDto {
  @ApiProperty({ type: 'string' })
  declare id: string;

  @ApiProperty({ type: 'string' })
  declare name: string;

  @ApiProperty({ type: 'string' })
  declare streamUrl: string;
}

export class SubsonicInternetRadioStationsDataDto {
  @ApiProperty({ type: SubsonicInternetRadioStationDto, isArray: true })
  declare internetRadioStation: SubsonicInternetRadioStationDto[];
}

export class SubsonicInternetRadioStationsResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicInternetRadioStationsDataDto })
  declare internetRadioStations: SubsonicInternetRadioStationsDataDto;
}
