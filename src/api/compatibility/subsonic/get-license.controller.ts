import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicLicenseController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getLicense', 'getLicense.view'])
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
