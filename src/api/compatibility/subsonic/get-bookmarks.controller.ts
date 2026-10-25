import { Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicBookmarksResponseDto } from './dtos';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicBookmarksController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getBookmarks', HttpStatus.OK, {
    summary: 'Get Bookmarks',
    description: 'Retrieve the user bookmarks.',
    responses: {
      [HttpStatus.OK]: SubsonicBookmarksResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getBookmarks(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      bookmarks: {},
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
