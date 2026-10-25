import { Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicPodcastsResponseDto } from './dtos';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicPodcastsController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getPodcasts', HttpStatus.OK, {
    summary: 'Get Podcasts',
    description: 'Retrieve the podcast subscriptions and episodes.',
    responses: {
      [HttpStatus.OK]: SubsonicPodcastsResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getPodcasts(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      podcasts: {},
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
