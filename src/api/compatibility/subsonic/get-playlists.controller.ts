import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicPlaylistsResponseDto } from './dtos';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicPlaylistsController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getPlayLists', HttpStatus.OK, {
    summary: 'Get Playlists',
    description: 'Retrieve the user playlists.',
    responses: {
      [HttpStatus.OK]: SubsonicPlaylistsResponseDto,
    },
  })
  async getPlayLists(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      playlists: {},
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
