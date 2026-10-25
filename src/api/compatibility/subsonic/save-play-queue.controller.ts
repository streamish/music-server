import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicSavePlayQueueResponseDto } from './dtos';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicSavePlayQueueController {
  // Placeholder: accepts the request and reports success without persisting anything
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'savePlayQueue', HttpStatus.OK, {
    summary: 'Save Play Queue',
    description: 'Report success for a play queue save request.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicSavePlayQueueResponseDto),
    },
  })
  savePlayQueue(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
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
