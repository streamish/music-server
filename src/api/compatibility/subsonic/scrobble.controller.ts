import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicScrobbleResponseDto } from './dtos';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicScrobbleController {
  // Placeholder: accepts the request and reports success without persisting anything
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'scrobble', HttpStatus.OK, {
    summary: 'Scrobble',
    description: 'Report success for a scrobble request.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicScrobbleResponseDto),
    },
  })
  scrobble(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({}, jsonResponse, res);
  }
}
