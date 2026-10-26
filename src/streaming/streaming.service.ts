import { FileTypeEnum } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { RootPathEntity, TrackEntity } from 'src/database/entities';
import { createReadStream } from 'node:fs';
import { getAudioContentType } from 'src/utils/strings';
import { join } from 'node:path';
import { stat } from 'node:fs/promises';
import type { Request, Response } from 'express';

export interface TrackStreamInfo {
  path: string;
  codec: FileTypeEnum;
  fileSize: number;
  updatedAt: Date;
}

interface StreamOptions {
  fileName: string;
  etag?: string;
}

interface ByteRange {
  start: number;
  end: number;
}

const emptyStream = Buffer.alloc(0);

@Injectable()
export class StreamingService {
  constructor(
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  async getTrack(accountId: number, trackId: number): Promise<TrackStreamInfo> {
    const track = await this.trackEntity.findOne({
      attributes: ['createdAt', 'filePath', 'fileSize', 'fileType', 'updatedAt'],
      where: {
        id: trackId,
        accountId,
      },
      include: [
        {
          attributes: ['rootPath'],
          model: RootPathEntity,
        },
      ],
    });
    if (!track?.rootPath?.rootPath) {
      throw new NotFoundException('Track not found');
    }
    return {
      path: join(track.rootPath.rootPath, track.filePath),
      codec: track.fileType,
      fileSize: track.fileSize || 0,
      updatedAt: track.updatedAt || track.createdAt,
    };
  }

  async streamFile(
    path: string,
    codec: FileTypeEnum,
    request: Request,
    response: Response,
    options: StreamOptions,
  ): Promise<StreamableFile> {
    let fileStats;
    try {
      fileStats = await stat(path);
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? error.code : undefined;
      if (code === 'ENOENT' || code === 'ENOTDIR') {
        throw new NotFoundException('Track file not found');
      }
      throw error;
    }
    if (!fileStats.isFile()) {
      throw new NotFoundException('Track file not found');
    }
    const lastModified = fileStats.mtime.toUTCString();
    response.set({
      'Accept-Ranges': 'bytes',
      'Content-Disposition': `inline; filename="${options.fileName}"`,
      'Content-Type': getAudioContentType(codec),
      'Last-Modified': lastModified,
    });
    if (options.etag) {
      response.set('ETag', options.etag);
    }
    if (request.fresh) {
      response.status(304);
      return new StreamableFile(emptyStream);
    }
    const rangeHeader = request.headers.range;
    const ifRange = request.headers['if-range'];
    const rangeMatchesValidator = !ifRange || ifRange === options.etag || ifRange === lastModified;
    const range = rangeMatchesValidator ? this.parseRange(rangeHeader, fileStats.size) : undefined;
    if (range === null) {
      response.status(416).set({
        'Content-Range': `bytes */${fileStats.size}`,
        'Content-Length': '0',
      });
      return new StreamableFile(emptyStream);
    }
    if (range) {
      response.status(206).set({
        'Content-Length': String(range.end - range.start + 1),
        'Content-Range': `bytes ${range.start}-${range.end}/${fileStats.size}`,
      });
      return new StreamableFile(createReadStream(path, range));
    }
    response.set('Content-Length', String(fileStats.size));
    return new StreamableFile(createReadStream(path));
  }

  // eslint-disable-next-line class-methods-use-this
  private parseRange(header: string | undefined, size: number): ByteRange | null | undefined {
    if (!header) {
      return undefined;
    }
    const match = /^bytes=(\d*)-(\d*)$/.exec(header);
    if (!match || (!match[1] && !match[2])) {
      return undefined;
    }
    if (size === 0) {
      return null;
    }
    const startValue = match[1] ? Number(match[1]) : undefined;
    const endValue = match[2] ? Number(match[2]) : undefined;
    if (
      (startValue !== undefined && !Number.isSafeInteger(startValue)) ||
      (endValue !== undefined && !Number.isSafeInteger(endValue))
    ) {
      return undefined;
    }
    if (startValue === undefined) {
      if (endValue === undefined || endValue === 0) {
        return null;
      }
      return {
        start: Math.max(size - endValue, 0),
        end: size - 1,
      };
    }
    if (startValue >= size || (endValue !== undefined && startValue > endValue)) {
      return null;
    }
    return {
      start: startValue,
      end: Math.min(endValue ?? size - 1, size - 1),
    };
  }
}
