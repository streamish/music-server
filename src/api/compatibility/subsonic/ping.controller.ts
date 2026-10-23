import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicPingController {
  /* eslint-disable-next-line class-methods-use-this */
  @Get(['ping', 'ping.view'])
  ping(@ResponseFormat() jsonResponse: boolean) {
    const responseData = {
      'subsonic-response': {
        status: 'ok',
        version: '1.16.1',
      },
    };
    if (jsonResponse) {
      return responseData;
    }
    return objectToXml(responseData, 'subsonic-response');
  }
}
