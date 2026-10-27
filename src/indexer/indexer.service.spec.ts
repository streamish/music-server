import { IndexerLogService } from './indexer-log.service';
import { IndexerService } from './indexer.service';
import { LibraryScannerService } from './library-scanner.service';
import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { join } from 'node:path';
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type { IAudioMetadata } from 'src/types/music-metadata';
import type { IndexedFile } from './types';
import type { RootPathEntity } from 'src/database/entities';

describe('IndexerService', () => {
  let tempDir: string;
  let rootPath: RootPathEntity;
  let service: IndexerService;
  let trackEntity: { destroy: jest.Mock; create: jest.Mock; update: jest.Mock; findByPk: jest.Mock };
  let rootPathEntity: { findByPk: jest.Mock };
  let indexFolderService: { indexFolders: jest.Mock };
  let indexFileService: {
    listIndexedFiles: jest.Mock<() => Promise<IndexedFile[]>>;
    applyCustomTrackData: jest.Mock<(id: number, data: IAudioMetadata) => Promise<IAudioMetadata>>;
  };
  let indexAlbumService: { updateAlbum: jest.Mock };
  let trackSynchronizer: { syncTrack: jest.Mock };
  let parseMetaData: jest.Mock;

  async function addFile(name: string) {
    await writeFile(join(tempDir, name), '');
    return (await stat(join(tempDir, name))).mtime;
  }

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    tempDir = await mkdtemp(join(tmpdir(), 'indexer-spec-'));
    rootPath = { id: 1, accountId: 1, rootPath: tempDir } as RootPathEntity;
    let nextId = 100;
    trackEntity = {
      destroy: jest.fn<() => Promise<number>>().mockResolvedValue(0),
      create: jest.fn<() => Promise<{ id: number }>>().mockImplementation(() => {
        nextId += 1;
        return Promise.resolve({ id: nextId });
      }),
      update: jest.fn<() => Promise<unknown>>().mockResolvedValue([1]),
      findByPk: jest.fn<() => Promise<unknown>>(),
    };
    rootPathEntity = { findByPk: jest.fn<() => Promise<unknown>>().mockResolvedValue(rootPath) };
    indexFolderService = { indexFolders: jest.fn<() => Promise<void>>().mockResolvedValue(undefined) };
    indexFileService = {
      listIndexedFiles: jest.fn<() => Promise<IndexedFile[]>>().mockResolvedValue([]),
      applyCustomTrackData: jest
        .fn<(id: number, data: IAudioMetadata) => Promise<IAudioMetadata>>()
        .mockImplementation((_id, data) => Promise.resolve(data)),
    };
    indexAlbumService = { updateAlbum: jest.fn<() => Promise<{ id: number }>>().mockResolvedValue({ id: 1 }) };
    trackSynchronizer = { syncTrack: jest.fn<() => Promise<void>>().mockResolvedValue(undefined) };
    parseMetaData = jest.fn<() => Promise<IAudioMetadata>>().mockResolvedValue({} as IAudioMetadata);
    service = new IndexerService(
      indexAlbumService as never,
      indexFileService as never,
      indexFolderService as never,
      new IndexerLogService(),
      new LibraryScannerService(),
      trackSynchronizer as never,
      trackEntity as never,
      {} as never,
      rootPathEntity as never,
      {} as never,
    );
    (service as unknown as { parseMetaData: jest.Mock }).parseMetaData = parseMetaData;
    jest.spyOn(service, 'isDisabled').mockResolvedValue(false);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('scanRootPath', () => {
    it('should not delete tracks when the folder scan is interrupted', async () => {
      await mkdir(join(tempDir, 'Artist', 'Album'), { recursive: true });
      jest.spyOn(service, 'isDisabled').mockResolvedValueOnce(false).mockResolvedValue(true);
      await service.scanRootPath(rootPath);
      expect(indexFileService.listIndexedFiles).not.toHaveBeenCalled();
      expect(trackEntity.destroy).not.toHaveBeenCalled();
      expect(indexFolderService.indexFolders).not.toHaveBeenCalled();
    });

    it('should delete tracks whose files are gone by id', async () => {
      indexFileService.listIndexedFiles.mockResolvedValue([{ id: 7, filePath: '/gone.mp3', fileMtime: new Date() }]);
      await service.scanRootPath(rootPath);
      expect(trackEntity.destroy).toHaveBeenCalledWith({ where: { id: { [Symbol.for('in')]: [7] } } });
      expect(indexFolderService.indexFolders).toHaveBeenCalledWith(rootPath);
    });

    it('should delete large numbers of stale tracks in batches', async () => {
      const stale = Array.from({ length: 1200 }, (_v, i) => ({
        id: i + 1,
        filePath: `/${i}.mp3`,
        fileMtime: new Date(),
      }));
      indexFileService.listIndexedFiles.mockResolvedValue(stale);
      await service.scanRootPath(rootPath);
      expect(trackEntity.destroy).toHaveBeenCalledTimes(3);
    });

    it('should add new files', async () => {
      await addFile('a.mp3');
      await service.scanRootPath(rootPath);
      expect(trackEntity.create).toHaveBeenCalledWith(expect.objectContaining({ filePath: '/a.mp3', fileType: 'mp3' }));
      expect(trackSynchronizer.syncTrack).toHaveBeenCalledTimes(1);
      expect(trackEntity.update).toHaveBeenCalledTimes(1);
    });

    it('should not parse files that are unchanged', async () => {
      const mtime = await addFile('a.mp3');
      indexFileService.listIndexedFiles.mockResolvedValue([{ id: 5, filePath: '/a.mp3', fileMtime: mtime }]);
      await service.scanRootPath(rootPath);
      expect(parseMetaData).not.toHaveBeenCalled();
      expect(trackEntity.destroy).not.toHaveBeenCalled();
    });

    it('should update modified files without creating a track', async () => {
      await addFile('a.mp3');
      indexFileService.listIndexedFiles.mockResolvedValue([{ id: 5, filePath: '/a.mp3', fileMtime: new Date(1) }]);
      await service.scanRootPath(rootPath);
      expect(indexFileService.applyCustomTrackData).toHaveBeenCalledWith(5, expect.anything());
      expect(trackEntity.create).not.toHaveBeenCalled();
      expect(trackSynchronizer.syncTrack).toHaveBeenCalledWith(1, 5, expect.anything());
    });

    it('should continue with remaining files when metadata cannot be read', async () => {
      await Promise.all(['a.mp3', 'b.mp3', 'c.mp3'].map((name) => addFile(name)));
      parseMetaData.mockImplementationOnce(() => Promise.reject(new Error('corrupt file')));
      await service.scanRootPath(rootPath);
      expect(parseMetaData).toHaveBeenCalledTimes(3);
      expect(trackEntity.create).toHaveBeenCalledTimes(2);
    });

    it('should continue with remaining files when an album cannot be found', async () => {
      await Promise.all(['a.mp3', 'b.mp3', 'c.mp3'].map((name) => addFile(name)));
      indexAlbumService.updateAlbum.mockResolvedValueOnce(null as never);
      await service.scanRootPath(rootPath);
      expect(trackEntity.create).toHaveBeenCalledTimes(2);
    });

    it('should remove a new track that could not be synchronized and continue', async () => {
      await Promise.all(['a.mp3', 'b.mp3'].map((name) => addFile(name)));
      trackSynchronizer.syncTrack.mockImplementationOnce(() => Promise.reject(new Error('db error')));
      await service.scanRootPath(rootPath);
      expect(trackEntity.destroy).toHaveBeenCalledWith({ where: { id: 101 } });
      expect(trackEntity.create).toHaveBeenCalledTimes(2);
      expect(indexFolderService.indexFolders).toHaveBeenCalled();
    });

    it('should stop indexing when disabled part way but still refresh folders', async () => {
      await Promise.all(['a.mp3', 'b.mp3', 'c.mp3'].map((name) => addFile(name)));
      jest.spyOn(service, 'isDisabled').mockImplementation(() => Promise.resolve(parseMetaData.mock.calls.length >= 1));
      await service.scanRootPath(rootPath);
      expect(parseMetaData).toHaveBeenCalledTimes(1);
      expect(indexFolderService.indexFolders).toHaveBeenCalledWith(rootPath);
    });
  });

  describe('scanFile', () => {
    it('should throw when the track does not exist', async () => {
      trackEntity.findByPk.mockResolvedValue(null as never);
      await expect(service.scanFile(1)).rejects.toThrow();
    });

    it('should throw when the file cannot be read', async () => {
      trackEntity.findByPk.mockResolvedValue({ filePath: '/a.mp3', rootPathId: 1 } as never);
      parseMetaData.mockImplementationOnce(() => Promise.reject(new Error('corrupt')));
      await expect(service.scanFile(9)).rejects.toThrow();
    });

    it('should re-synchronize an existing track', async () => {
      trackEntity.findByPk.mockResolvedValue({ filePath: '/a.mp3', rootPathId: 1 } as never);
      await service.scanFile(9);
      expect(indexFileService.applyCustomTrackData).toHaveBeenCalledWith(9, expect.anything());
      expect(trackSynchronizer.syncTrack).toHaveBeenCalledWith(1, 9, expect.anything());
    });
  });
});
