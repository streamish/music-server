import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicLicenseResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { objectToXml } from 'src/utils/xml';
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
  async getLicense(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    const licenseExpires = date.toISOString();
    const license = {
      valid: true,
      email: 'user@example.com',
      licenseExpires,
    };
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      license,
    };
    if (jsonResponse) {
      res.setHeader('Content-Type', 'application/json');
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    res.setHeader('Content-Type', 'application/xml');
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }
}
