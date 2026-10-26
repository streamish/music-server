import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicSavePlayQueueResponseDto } from './dtos';
import { formatResponse } from './subsonic.response';
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
  savePlayQueue(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    return formatResponse({}, isJsonResponse, res);
  }
}
