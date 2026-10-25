import { AUDIO_MIME_TYPES, BINARY_RESPONSE } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiTracksService } from './tracks.service';
import { Controller, Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { ListTracksQueryDto, ListTracksResponseDto, StreamFileQueryDto } from './dtos';
import { User } from 'src/api/user.decorator';
import { getAudioContentType } from 'src/utils/strings';
import { getValidationMessages } from 'src/api/response.dto';
import { readFileSync } from 'fs';
import type { Request, Response } from 'express';

const emptyBuffer = Buffer.alloc(0);

@Controller('/api')
export class ApiTracksController {
  constructor(private readonly tracksService: ApiTracksService) {}

  /**
   * `GET` request to `/api/list-tracks`
   */
  @ApiEndpoint(Get, 'list-tracks', HttpStatus.OK, {
    summary: 'List tracks',
    description: 'Tracks can be filtered by an extensive set of criteria and search terms.',
    allowAdministrator: true,
    allowUser: true,
    isFiltered: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: ListTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListTracksQueryDto),
    },
  })
  async listTracks(@User() user: AccountEntity, @Query() query: ListTracksQueryDto) {
    const data = await this.tracksService.listTracks(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/stream-track`
   */
  @ApiEndpoint(Get, 'stream-track', HttpStatus.OK, {
    summary: 'Serves track files',
    description: [
      `Downloads track files from the music library to the client.',
      'This is used to stream audio files for playback or to download for offline usage.',
      'The audio files are streamed in their original format and the client is responsible for decoding and playback.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    produces: [...AUDIO_MIME_TYPES],
    responses: {
      [HttpStatus.OK]: BINARY_RESPONSE,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.FILE_NOT_FOUND_ERROR],
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: StreamFileQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const streamInfo = await this.tracksService.getStream(user.id, query.id);
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
