import { Controller, Get, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetLicenseController {
  // eslint-disable-next-line class-methods-use-this
  @Get('getLicense')
  async getLicense(@ResponseFormat() jsonResponse: boolean) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    const licenseExpires = date.toISOString().slice(0, 19);
    const license = {
      valid: true,
      email: 'user@example.com',
      licenseExpires,
    };
    if (jsonResponse) {
      return {
        'subsonic-response': {
          license,
        },
      };
    }
    return objectToXml({ license }, 'subsonic-response');
  }
}
