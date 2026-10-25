import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicPingResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicPingController {
  /* eslint-disable-next-line class-methods-use-this */
  @SubsonicApiEndpoint(Get, 'ping', HttpStatus.OK, {
    summary: 'Ping',
    description: 'Test connectivity with the Subsonic server.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicPingResponseDto),
    },
  })
  ping(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
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
