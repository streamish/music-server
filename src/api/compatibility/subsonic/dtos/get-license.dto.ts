import { SubsonicResponseDto } from '../subsonic.dto';

export class SubsonicLicenseResponseDto extends SubsonicResponseDto {
  declare license: {
    valid: boolean;
    email: string;
    licenseExpires: string;
  };
}
