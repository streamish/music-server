import { AccountEntity } from 'src/database/entities';
import { ApiTracksService } from 'src/api/media/tracks/tracks.service';
import { Get, HttpStatus, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { SubsonicErrorCode, SubsonicException } from './subsonic-error';
import { SubsonicStreamQueryDto, SubsonicStreamResponseDto } from './dtos';
import { User } from 'src/api/user.decorator';
import { createReadStream, statSync } from 'node:fs';
import { getAudioContentType } from 'src/utils/strings';
import type { Request, Response } from 'express';

import { SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';

@SubsonicController()
export class SubsonicStreamController {
  constructor(
    private readonly tracksService: ApiTracksService,
    private readonly libraryService: LibraryService,
  ) {}

  /**
   * Streams the original file, with `Range` support for seeking.
   * Transcoding parameters such as `maxBitRate` and `format` are ignored.
   */
  @SubsonicApiEndpoint(Get, ['stream', 'download'], HttpStatus.OK, {
    summary: 'Stream',
    description: 'Stream or download a song.',
    responses: {
      [HttpStatus.OK]: SubsonicStreamResponseDto,
    },
  })
  async stream(
    @User() user: AccountEntity,
    @Query() query: SubsonicStreamQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const notFound = new SubsonicException(SubsonicErrorCode.DATA_NOT_FOUND, 'The requested data was not found');
    const tracks = await this.libraryService.retrieveTrack(user.id, query.id).catch(() => undefined);
    if (!tracks?.[0]) {
      throw notFound;
    }
    const streamInfo = await this.tracksService.getStream(query.id).catch(() => undefined);
    let size: number;
    try {
      size = statSync(streamInfo?.path || '').size;
    } catch {
      throw notFound;
    }
    const fileType = streamInfo?.path.split('.').pop();
    res.set({
      'Accept-Ranges': 'bytes',
      'Content-Disposition': `inline; filename="track.${query.id}.${fileType}"`,
      'Content-Type': getAudioContentType(streamInfo!.codec),
    });
    const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
    if (match && (match[1] || match[2])) {
      let start: number;
      let end: number;
      if (match[1]) {
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      } else {
        start = Math.max(size - Number(match[2]), 0);
        end = size - 1;
      }
      if (start > end || start >= size) {
        res.status(416).set('Content-Range', `bytes */${size}`);
        return new StreamableFile(Buffer.alloc(0));
      }
      res.status(206).set({
        'Content-Length': `${end - start + 1}`,
        'Content-Range': `bytes ${start}-${end}/${size}`,
      });
      return new StreamableFile(createReadStream(streamInfo!.path, { start, end }));
    }
    res.set('Content-Length', `${size}`);
    return new StreamableFile(createReadStream(streamInfo!.path));
  }
}
