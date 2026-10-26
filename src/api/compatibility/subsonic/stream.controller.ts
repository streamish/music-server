import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { StreamingService } from 'src/streaming/streaming.service';
import { SubsonicStreamQueryDto } from './dtos';
import { User } from 'src/api/user.decorator';
import type { Request, Response } from 'express';

import { BINARY_RESPONSE } from 'src/constants/swagger';
import { SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';

@SubsonicController()
export class SubsonicStreamController {
  constructor(private readonly streamingService: StreamingService) {}

  /**
   * Streams the original file, with `Range` support for seeking.
   * Transcoding parameters such as `maxBitRate` and `format` are ignored.
   */
  @SubsonicApiEndpoint(Get, ['stream', 'download'], HttpStatus.OK, {
    summary: 'Stream',
    description: 'Stream or download a song.',
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async stream(
    @User() user: AccountEntity,
    @Query() query: SubsonicStreamQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const streamInfo = await this.streamingService.getTrack(user.id, query.id);
    return this.streamingService.streamFile(streamInfo.path, streamInfo.codec, request, res, {
      fileName: `track.${query.id}.${streamInfo.codec}`,
    });
  }
}
