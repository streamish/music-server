import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicScrobbleResponseDto } from './dtos';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicScrobbleController {
  // Placeholder: accepts the request and reports success without persisting anything
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'scrobble', HttpStatus.OK, {
    summary: 'Scrobble',
    description: 'Report success for a scrobble request.',
    responses: {
      [HttpStatus.OK]: SubsonicScrobbleResponseDto,
    },
  })
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
