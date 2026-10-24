import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicLicenseController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getLicense', 'getLicense.view'])
  async getLicense(@ResponseFormat() jsonResponse: boolean) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    const licenseExpires = date.toISOString().slice(0, 19);
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
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }
}
