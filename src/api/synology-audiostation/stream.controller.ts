import { AUDIO_MIME_TYPES, BINARY_RESPONSE } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Logger, Query, Res } from '@nestjs/common';
import { StreamCgiQueryDto } from './dtos';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyStreamService } from './stream.service';
import { User } from '../user.decorator';
import { getAudioContentType } from 'src/utils/strings';
import type { Response } from 'express';

@SynologyController()
export class SynologyStreamController {
  private readonly logger: Logger = new Logger(SynologyStreamController.name);

  constructor(private readonly streamService: SynologyStreamService) {}

  @SynologyApiEndpoint(Get, '/AudioStation/stream.cgi', HttpStatus.OK, {
    summary: 'Streams audio files',
    description: [
      'Downloads audio files from the music library to the client.',
      'This is used to stream audio files for playback or to download for offline usage.',
      'The files are streamed in their original format and the client is responsible for decoding and playing audio.',
      'Synology implements transcoding for certain formats, but this is not supported in this server.',
    ].join(' '),
    isAuthenticated: true,
    produces: AUDIO_MIME_TYPES,
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
    },
  })
  async getStreamCgi(@User() user: AccountEntity, @Query() query: StreamCgiQueryDto, @Res() res: Response) {
    const streamInfo = await this.streamService.getStream(user.id, query.id);
    res.sendFile(streamInfo.path, {
      headers: {
        'Content-Type': getAudioContentType(streamInfo.codec),
        'Content-Length': streamInfo.fileSize,
      },
    });
  }
}
