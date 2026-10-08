import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from '../api.decorator';
import { BINARY_RESPONSE } from 'src/constants/swagger';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { QnapAsGetFileQueryDto } from './dtos/as-get-file.dto';
import { QnapAsGetFileService } from './as-get-file.service';
import { QnapController } from './qnap.decorator';
import { User } from '../user.decorator';
import { getAudioContentType } from 'src/utils/strings';
import type { Response } from 'express';

@QnapController()
export class QnapAsGetFileController {
  constructor(private readonly qnapAsGetFileApiService: QnapAsGetFileService) {}

  @ApiEndpoint(Get, 'as_get_file_api.php', HttpStatus.OK, {
    summary: 'Streams a music file to QMusic clients',
    description: 'Streams a music file for playback.',
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async get(@User() user: AccountEntity, @Res() response: Response, @Query() query: QnapAsGetFileQueryDto) {
    const file = await this.qnapAsGetFileApiService.getFile(user.id, query.f);
    const eTag = `file-${query.f}-${file.updatedAt?.getTime() || ''}`;
    response.sendFile(file.fullPath, {
      headers: {
        'Content-Type': getAudioContentType(file.fileType),
        'Content-Length': file.fileSize,
        ETag: eTag,
      },
    });
  }
}
