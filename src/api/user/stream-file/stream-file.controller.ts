import { AUDIO_MIME_TYPES, BINARY_RESPONSE } from 'src/constants/swagger';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { UserStreamFileQueryDto } from './stream-file.dto';
import { UserStreamFileService } from './stream-file.service';
import { getAudioContentType } from 'src/utils/strings';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

const emptyBuffer = Buffer.alloc(0);

@UserController()
export class UserStreamFileController {
  constructor(private readonly streamFileService: UserStreamFileService) {}

  @ApiEndpoint(Get, 'stream-file', HttpStatus.OK, {
    summary: 'Serves audio files',
    description: [
      `Downloads audio files from the music library to the client.',
      'This is used to stream audio files for playback or to download for offline usage.',
      'The audio files are streamed in their original format and the client is responsible for decoding and playback.`,
    ].join(' '),
    isAuthenticated: true,
    produces: [...AUDIO_MIME_TYPES],
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.FILE_NOT_FOUND_ERROR],
    },
  })
  async get(
    @Query() query: UserStreamFileQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const streamInfo = await this.streamFileService.getStream(query.id);
    const fileType = streamInfo.path.split('.').pop();
    const eTag = `file-${query.id}-${streamInfo.updatedAt?.getTime() || ''}`;
    response.set({
      'Content-Disposition': `inline; filename="track.${query.id}.${fileType}"`,
      'Content-Type': getAudioContentType(streamInfo.codec),
      ETag: eTag,
    });
    if (request.fresh) {
      response.status(304);
      return new StreamableFile(emptyBuffer);
    }
    const buffer = readFileSync(streamInfo.path);
    return new StreamableFile(buffer);
  }
}
