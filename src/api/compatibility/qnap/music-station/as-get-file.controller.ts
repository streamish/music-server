import { AccountEntity } from 'src/database/entities';
import { BINARY_RESPONSE } from 'src/constants/swagger';
import { Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import { QnapAsGetFileQueryDto } from './dtos/as-get-file.dto';
import { StreamingService } from 'src/streaming/streaming.service';
import { User } from '../../../user.decorator';
import type { Request, Response } from 'express';

@QnapController({ path: '/musicstation/api' })
export class QnapAsGetFileController {
  constructor(private readonly streamingService: StreamingService) {}

  @QnapApiEndpoint(Get, 'as_get_file_api.php', HttpStatus.OK, {
    summary: 'Streams a music file to QMusic clients',
    description: 'Streams a music file for playback.',
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async get(
    @User() user: AccountEntity,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Query() query: QnapAsGetFileQueryDto,
  ) {
    const file = await this.streamingService.getTrack(user.id, query.f);
    return this.streamingService.streamFile(file.path, file.codec, request, response, {
      fileName: `track.${query.f}.${file.codec}`,
      trackId: file.trackId,
      etag: `file-${query.f}-${file.updatedAt.getTime()}`,
    });
  }
}
