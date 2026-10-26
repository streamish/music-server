import { AUDIO_MIME_TYPES, BINARY_RESPONSE } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { StreamCgiQueryDto } from './dtos';
import { StreamingService } from 'src/streaming/streaming.service';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { User } from '../../../user.decorator';
import type { Request, Response } from 'express';

@SynologyController()
export class SynologyStreamController {
  constructor(private readonly streamingService: StreamingService) {}

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
  async getStreamCgi(
    @User() user: AccountEntity,
    @Query() query: StreamCgiQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const streamInfo = await this.streamingService.getTrack(user.id, query.id);
    return this.streamingService.streamFile(streamInfo.path, streamInfo.codec, request, response, {
      fileName: `track.${query.id}.${streamInfo.codec}`,
      etag: `file-${query.id}-${streamInfo.updatedAt.getTime()}`,
    });
  }
}
