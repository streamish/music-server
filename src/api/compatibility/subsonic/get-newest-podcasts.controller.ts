import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicNewestPodcastsResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicNewestPodcastsController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getNewestPodcasts', HttpStatus.OK, {
    summary: 'Get Newest Podcasts',
    description: 'Retrieve the newest podcast episodes.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicNewestPodcastsResponseDto),
    },
  })
  async getNewestPodcasts(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({ newestPodcasts: {} }, isJsonResponse, res);
  }
}
