import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicBookmarksResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicBookmarksController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getBookmarks', HttpStatus.OK, {
    summary: 'Get Bookmarks',
    description: 'Retrieve the user bookmarks.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicBookmarksResponseDto),
    },
  })
  async getBookmarks(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({ bookmarks: {} }, jsonResponse, res);
  }
}
