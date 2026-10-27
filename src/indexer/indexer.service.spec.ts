import { IndexerService } from './indexer.service';
import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { join } from 'node:path';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type { FileItem, FileUpdateItem } from './types';
import type { IAudioMetadata } from 'src/types/music-metadata';
import type { RootPathEntity } from 'src/database/entities';

describe('IndexerService', () => {
  let tempDir: string;
  let rootPath: RootPathEntity;
  let service: IndexerService;
  let trackEntity: { destroy: jest.Mock; create: jest.Mock };
  let indexFolderService: { indexFolders: jest.Mock };
  let indexFileService: { retrieveLastModified: jest.Mock };
  let indexAlbumService: { updateAlbum: jest.Mock };
  let parseMetaData: jest.Mock;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    tempDir = await mkdtemp(join(tmpdir(), 'indexer-spec-'));
    rootPath = { id: 1, accountId: 1, rootPath: tempDir } as RootPathEntity;
    trackEntity = {
      destroy: jest.fn<() => Promise<number>>().mockResolvedValue(0),
      create: jest.fn<() => Promise<{ id: number }>>().mockResolvedValue({ id: 1 }),
    };
    indexFolderService = { indexFolders: jest.fn<() => Promise<void>>().mockResolvedValue(undefined) };
    indexFileService = { retrieveLastModified: jest.fn<() => Promise<null>>().mockResolvedValue(null) };
    indexAlbumService = { updateAlbum: jest.fn<() => Promise<{ id: number }>>().mockResolvedValue({ id: 1 }) };
    parseMetaData = jest.fn<() => Promise<IAudioMetadata>>().mockResolvedValue({} as IAudioMetadata);
    service = new IndexerService(
      indexAlbumService as never,
      {} as never,
      indexFileService as never,
      indexFolderService as never,
      trackEntity as never,
      {} as never,
      {} as never,
      {} as never,
    );
    (service as unknown as { parseMetaData: jest.Mock }).parseMetaData = parseMetaData;
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('scanRootPath', () => {
    it('should not delete tracks when the scan is interrupted by the indexer being disabled', async () => {
      await mkdir(join(tempDir, 'Artist', 'Album'), { recursive: true });
      await writeFile(join(tempDir, 'Artist', 'Album', '01 Track.mp3'), '');
      // enabled when the scan starts, then disabled before any folder is read
      jest.spyOn(service, 'isDisabled').mockResolvedValueOnce(false).mockResolvedValue(true);
      await service.scanRootPath(rootPath);
      expect(trackEntity.destroy).not.toHaveBeenCalled();
      expect(indexFolderService.indexFolders).not.toHaveBeenCalled();
    });

    it('should delete stale tracks when the scan completes', async () => {
      jest.spyOn(service, 'isDisabled').mockResolvedValue(false);
      await service.scanRootPath(rootPath);
      expect(trackEntity.destroy).toHaveBeenCalledTimes(1);
      expect(indexFolderService.indexFolders).toHaveBeenCalledWith(rootPath);
    });
  });

  describe('scanFolderContents', () => {
    it('should report completion and collect only supported audio files', async () => {
      await writeFile(join(tempDir, '01 Track.mp3'), '');
      await writeFile(join(tempDir, '01 Track.lrc'), '');
      jest.spyOn(service, 'isDisabled').mockResolvedValue(false);
      const filesToScan: FileItem[] = [];
      const completed = await service.scanFolderContents(rootPath, [tempDir], filesToScan, [tempDir]);
      expect(completed).toBe(true);
      expect(filesToScan.map((file) => file.path)).toEqual([join(tempDir, '01 Track.mp3')]);
    });

    it('should report an interrupted scan when the indexer is disabled', async () => {
      jest.spyOn(service, 'isDisabled').mockResolvedValue(true);
      const completed = await service.scanFolderContents(rootPath, [tempDir], [], [tempDir]);
      expect(completed).toBe(false);
    });
  });

  describe('checkFile', () => {
    function createFileItems(names: string[]): FileItem[] {
      return names.map((name) => ({ path: join(tempDir, name), lastModified: new Date(2020, 0, 1), size: 1 }));
    }

    beforeEach(() => {
      jest.spyOn(service, 'isDisabled').mockResolvedValue(false);
    });

    it('should continue checking remaining files when metadata cannot be read', async () => {
      parseMetaData.mockImplementationOnce(() => Promise.reject(new Error('corrupt file')));
      const filesToUpdate: FileUpdateItem[] = [];
      await service.checkFile(rootPath, createFileItems(['a.mp3', 'b.mp3', 'c.mp3']), filesToUpdate);
      expect(parseMetaData).toHaveBeenCalledTimes(3);
      expect(filesToUpdate.map((file) => file.path)).toEqual(['b.mp3', 'c.mp3'].map((name) => `/${name}`));
    });

    it('should continue checking remaining files when an album cannot be found', async () => {
      indexAlbumService.updateAlbum.mockResolvedValueOnce(null as never);
      const filesToUpdate: FileUpdateItem[] = [];
      await service.checkFile(rootPath, createFileItems(['a.mp3', 'b.mp3', 'c.mp3']), filesToUpdate);
      expect(trackEntity.create).toHaveBeenCalledTimes(2);
      expect(filesToUpdate).toHaveLength(2);
    });
  });
});
