import { AUDIO_MIME_TYPES, BINARY_RESPONSE, COOKIE_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/api/role.guard';
import { UserStreamFileNotFoundResponseDto, UserStreamFileQueryDto } from './stream-file.dto';
import { UserStreamFileService } from './stream-file.service';
import { getAudioContentType } from 'src/utils/strings';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserStreamFileController {
  constructor(private readonly streamFileService: UserStreamFileService) {}

  @Get('stream-file')
  @ApiOperation({
    summary: 'Serves audio files',
    description: [
      // eslint-disable-next-line max-len
      `Downloads audio files from the music library to the client.  This is used to stream audio files for playback or to download for offline usage.  The audio files are streamed in their original format and the client is responsible for decoding and playing the audio.`,
    ].join('\n\n'),
  })
  @ApiHeader(COOKIE_TOKEN_HEADER)
  @ApiOkResponse(BINARY_RESPONSE)
  @ApiNotFoundResponse({
    description: 'The requested file was not found',
    type: UserStreamFileNotFoundResponseDto,
  })
  @ApiProduces(...AUDIO_MIME_TYPES)
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
