import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicPlaylistsResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicPlaylistsController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getPlayLists', HttpStatus.OK, {
    summary: 'Get Playlists',
    description: 'Retrieve the user playlists.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicPlaylistsResponseDto),
    },
  })
  async getPlayLists(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({ playlists: {} }, isJsonResponse, res);
  }
}
