import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicPingResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { formatResponse } from './subsonic.response';
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
  ping(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({}, isJsonResponse, res);
  }
}
