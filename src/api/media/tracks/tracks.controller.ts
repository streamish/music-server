import { AUDIO_MIME_TYPES, BINARY_RESPONSE } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiTracksService } from './tracks.service';
import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { ListTracksQueryDto, ListTracksResponseDto, StreamFileQueryDto } from './dtos';
import { StreamingService } from 'src/streaming/streaming.service';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';
import type { Request, Response } from 'express';

@Controller('/api')
export class ApiTracksController {
  constructor(
    private readonly tracksService: ApiTracksService,
    private readonly streamingService: StreamingService,
  ) {}

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
    const streamInfo = await this.streamingService.getTrack(user.id, query.id);
    const eTag = `file-${query.id}-${streamInfo.updatedAt?.getTime() || ''}`;
    return this.streamingService.streamFile(streamInfo.path, streamInfo.codec, request, response, {
      fileName: `track.${query.id}.${streamInfo.codec}`,
      trackId: streamInfo.trackId,
      etag: eTag,
    });
  }
}
