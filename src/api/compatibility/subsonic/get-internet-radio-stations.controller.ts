import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicInternetRadioStationsResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicInternetRadioStationsController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getInternetRadioStations', HttpStatus.OK, {
    summary: 'Get Internet Radio Stations',
    description: 'Retrieve configured internet radio stations.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicInternetRadioStationsResponseDto),
    },
  })
  async getInternetRadioStations(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      internetRadioStations: {},
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
