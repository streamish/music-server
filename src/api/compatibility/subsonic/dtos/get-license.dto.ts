/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicLicenseDto {
  @ApiProperty({ type: Boolean })
  declare valid: boolean;

  @ApiProperty({ type: String })
  declare email: string;

  @ApiProperty({ type: String })
  declare licenseExpires: string;
}

export class SubsonicLicenseResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicLicenseDto })
  declare license: SubsonicLicenseDto;
}
