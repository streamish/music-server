import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicLicenseResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicLicenseController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getLicense', HttpStatus.OK, {
    summary: 'Get License',
    description: 'Retrieve the server license information.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicLicenseResponseDto),
    },
  })
  async getLicense(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    const licenseExpires = date.toISOString();
    const license = {
      valid: true,
      email: 'user@example.com',
      licenseExpires,
    };
    return formatResponse({ license }, isJsonResponse, res);
  }
}
