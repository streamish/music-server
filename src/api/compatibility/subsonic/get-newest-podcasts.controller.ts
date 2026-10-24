import { Controller, Get, Header, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseFilters(SubsonicExceptionFilter)
@UseGuards(SubsonicAuthGuard)
export class SubsonicNewestPodcastsController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getNewestPodcasts', 'getNewestPodcasts.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getNewestPodcasts(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      newestPodcasts: {},
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
