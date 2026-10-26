import { FileTypeEnum } from 'src/types/enums';
import { ReadStream } from 'node:fs';
import { StreamingService } from './streaming.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TrackEntity } from 'src/database/entities';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getModelToken } from '@nestjs/sequelize';
import { join } from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type { Request, Response } from 'express';

describe('StreamingService', () => {
  let module: TestingModule;
  let streamingService: StreamingService;
  const trackEntity = {
    findOne: jest.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>(),
  };
  const request = {
    fresh: false,
    headers: {},
  } as Request;
  let response: Response;
  const responseStatus = jest.fn();
  const responseSet = jest.fn();

  beforeEach(async () => {
    trackEntity.findOne.mockReset();
    responseStatus.mockReset().mockReturnThis();
    responseSet.mockReset().mockReturnThis();
    response = {
      status: responseStatus,
      set: responseSet,
    } as unknown as Response;
    module = await Test.createTestingModule({
      providers: [StreamingService, { provide: getModelToken(TrackEntity), useValue: trackEntity }],
    }).compile();
    streamingService = module.get(StreamingService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('loads stream metadata scoped to the requesting account', async () => {
    const updatedAt = new Date();
    trackEntity.findOne.mockResolvedValue({
      createdAt: updatedAt,
      filePath: 'album/track.flac',
      fileSize: 123,
      fileType: FileTypeEnum.FLAC,
      updatedAt,
      rootPath: { rootPath: '/music' },
    });

    await expect(streamingService.getTrack(7, 12)).resolves.toEqual({
      path: join('/music', 'album/track.flac'),
      codec: FileTypeEnum.FLAC,
      fileSize: 123,
      updatedAt,
    });
    expect(trackEntity.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 12, accountId: 7 },
      }),
    );
  });

  it('returns a file stream with byte-range headers instead of buffering the file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'streamish-stream-'));
    const path = join(directory, 'track.mp3');
    const contents = Buffer.from('0123456789');
    await writeFile(path, contents);

    try {
      const file = await streamingService.streamFile(
        path,
        FileTypeEnum.MP3,
        {
          ...request,
          headers: { range: 'bytes=2-5' },
        } as Request,
        response,
        { fileName: 'track.mp3' },
      );
      const stream = file.getStream();

      expect(stream).toBeInstanceOf(ReadStream);
      expect(responseStatus).toHaveBeenCalledWith(206);
      expect(responseSet).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Length': '4',
          'Content-Range': 'bytes 2-5/10',
        }),
      );
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.once('end', resolve);
        stream.once('error', reject);
      });
      expect(Buffer.concat(chunks)).toEqual(contents.subarray(2, 6));
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('responds with 416 for an unsatisfiable range', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'streamish-stream-'));
    const path = join(directory, 'track.mp3');
    await writeFile(path, 'audio');

    try {
      const file = await streamingService.streamFile(
        path,
        FileTypeEnum.MP3,
        { ...request, headers: { range: 'bytes=99-' } } as Request,
        response,
        { fileName: 'track.mp3' },
      );

      expect(responseStatus).toHaveBeenCalledWith(416);
      expect(responseSet).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Range': 'bytes */5',
          'Content-Length': '0',
        }),
      );
      expect(file.getStream()).not.toBeInstanceOf(ReadStream);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
