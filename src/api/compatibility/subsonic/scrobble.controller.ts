import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
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
  scrobble(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({}, isJsonResponse, res);
  }
}
