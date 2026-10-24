import { Controller, Get, Header, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseFilters(SubsonicExceptionFilter)
@UseGuards(SubsonicAuthGuard)
export class SubsonicScrobbleController {
  // Placeholder: accepts the request and reports success without persisting anything
  // eslint-disable-next-line class-methods-use-this
  @Get(['scrobble', 'scrobble.view'])
  @Header('server', 'Jetty(6.1.x)')
  scrobble(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const responseData = {
      'subsonic-response': {
        status: 'ok',
        version: '1.16.1',
      },
    };
    if (jsonResponse) {
      res.setHeader('Content-Type', 'application/json');
      return responseData;
    }
    res.setHeader('Content-Type', 'application/xml');
    return objectToXml(responseData, 'subsonic-response');
  }
}
