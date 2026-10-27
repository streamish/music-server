import { ErrorCodes } from 'src/constants/error-codes';
import { FileItem } from './types';
import { IAudioMetadata, IOptions } from 'src/types/music-metadata';
import { IndexAlbumService } from './index-album.service';
import { IndexFolderService } from './index-folders.service';
import { IndexTrackService } from './index-track.service';
import { IndexerConfigurationEntity, RootPathEntity, TrackEntity } from 'src/database/entities';
import { IndexerLogService } from './indexer-log.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { LibraryScannerService } from './library-scanner.service';
import { Op } from 'sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';
import { TrackSynchronizerService } from './track-synchronizer.service';
import { basename, join } from 'node:path';
import { detectChanges } from './change-detector';
import { getAlbumPath, toRelativePath } from './indexer-paths';

const DELETE_BATCH_SIZE = 500;

@Injectable()
export class IndexerService {
  private readonly logger: Logger = new Logger(IndexerService.name);

  private parseMetaData!: (filePath: string, options?: IOptions) => Promise<IAudioMetadata>;

  constructor(
    private readonly indexAlbumService: IndexAlbumService,
    private readonly indexFileService: IndexTrackService,
    private readonly indexFolderService: IndexFolderService,
    private readonly indexerLog: IndexerLogService,
    private readonly libraryScanner: LibraryScannerService,
    private readonly trackSynchronizer: TrackSynchronizerService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(IndexerConfigurationEntity)
    private readonly indexerConfigurationEntity: typeof IndexerConfigurationEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @InjectModel(SystemConfigurationEntity)
    private readonly systemConfigurationEntity: typeof SystemConfigurationEntity,
  ) {}

  async getSystemConfiguration(): Promise<SystemConfigurationEntity> {
    const config = await this.systemConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    if (!config) {
      throw new Error(ErrorCodes.SYSTEM_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return config;
  }

  async getConfiguration(): Promise<IndexerConfigurationEntity> {
    const config = await this.indexerConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    if (!config) {
      throw new Error(ErrorCodes.INDEXER_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return config;
  }

  async isDisabled() {
    const config = await this.getConfiguration();
    return !config?.isEnabled;
  }

  async onModuleInit() {
    const musicMetaData = await import('music-metadata');
    this.parseMetaData = musicMetaData.parseFile;
  }

  /**
   * Performs a full scan of a root path and its nested contents, removes tracks whose files are gone and
   * indexes files that are new or have been modified.
   * @param rootPath The indexer root path being scanned
   */
  async scanRootPath(rootPath: RootPathEntity) {
    const { accountId } = rootPath;
    if (await this.isDisabled()) {
      this.indexerLog.addLogEntry(accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    this.indexerLog.addLogEntry(accountId, rootPath.id, `scanning root path `);
    const scan = await this.libraryScanner.scan(rootPath.rootPath, () => this.isDisabled());
    // an interrupted scan has an incomplete file list, so deleting "missing" tracks would remove valid ones
    if (!scan.completed) {
      this.indexerLog.addLogEntry(accountId, rootPath.id, 'folder scan was interrupted, skipping synchronization');
      return;
    }
    this.indexerLog.addLogEntry(
      accountId,
      rootPath.id,
      `root path contains ${scan.folderPaths.length} folders with ${scan.files.length} files`,
    );
    const indexed = await this.indexFileService.listIndexedFiles(accountId, rootPath.id);
    const changes = detectChanges(rootPath.rootPath, scan.files, indexed);
    const deleted = await this.deleteTracks(changes.deletedTrackIds);
    if (deleted) {
      this.indexerLog.addLogEntry(accountId, rootPath.id, `deleted ${deleted} stale file references from the database`);
    }
    const queue = [
      ...changes.added.map((file) => ({ file, trackId: undefined })),
      ...changes.modified.map(({ file, trackId }) => ({ file, trackId })),
    ];
    const result = { added: 0, updated: 0, failed: 0 };
    for (let i = 0; i < queue.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      if (await this.isDisabled()) {
        this.indexerLog.addLogEntry(accountId, rootPath.id, 'scanner is disabled, skipping scan');
        break;
      }
      const { file, trackId } = queue[i]!;
      try {
        // eslint-disable-next-line no-await-in-loop
        const outcome = await this.indexFile(rootPath, file, trackId);
        result[outcome] += 1;
      } catch (error) {
        result.failed += 1;
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`error indexing ${file.path}: ${message}`, error instanceof Error ? error.stack : undefined);
        this.indexerLog.addLogEntry(accountId, rootPath.id, `failed to index ${file.path}: ${message}`);
      }
    }
    this.indexerLog.addLogEntry(
      accountId,
      rootPath.id,
      `scan finished: ${result.added} added, ${result.updated} updated, ${deleted} deleted, ` +
        `${changes.unchanged} unchanged, ${result.failed} failed`,
    );
    // refreshes the folders after files were added or removed
    await this.indexFolderService.indexFolders(rootPath);
  }

  /**
   * Manually re-scan a single specific file after changes to its custom data.  This
   * does not involve file-system changes so the root paths are not re-scanned and the
   * folders are not re-indexed.
   * @param trackId The ID of the file
   */
  async scanFile(trackId: number) {
    this.logger.log(`manually scanning file with ID ${trackId}`);
    const file = await this.trackEntity.findByPk(trackId, {
      attributes: ['filePath', 'rootPathId'],
    });
    if (!file) {
      throw new Error(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const rootPath = await this.rootPathEntity.findByPk(file.rootPathId);
    if (!rootPath) {
      throw new Error(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    const filePath = join(rootPath.rootPath, file.filePath);
    const embeddedData = await this.readMetadata(filePath, trackId);
    if (!embeddedData) {
      throw new Error(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    await this.indexAlbumService.updateAlbum(
      rootPath,
      embeddedData,
      getAlbumPath(rootPath.rootPath, filePath),
      rootPath.accountId,
    );
    await this.trackSynchronizer.syncTrack(rootPath.accountId, trackId, embeddedData);
  }

  /**
   * Deletes tracks in batches, as a single statement with every ID could exceed the database's limit on parameters.
   * @param trackIds The IDs of the tracks to delete
   * @returns The number of tracks deleted
   */
  private async deleteTracks(trackIds: number[]): Promise<number> {
    let deleted = 0;
    for (let i = 0; i < trackIds.length; i += DELETE_BATCH_SIZE) {
      // eslint-disable-next-line no-await-in-loop
      deleted += await this.trackEntity.destroy({
        where: { id: { [Op.in]: trackIds.slice(i, i + DELETE_BATCH_SIZE) } },
      });
    }
    return deleted;
  }

  /**
   * Reads the metadata embedded in a file, with any custom data for an existing track applied.
   * @param filePath The absolute path of the file
   * @param [trackId] The ID of the track if the file is already indexed
   * @returns The metadata, or `undefined` if the file could not be read
   */
  private async readMetadata(filePath: string, trackId?: number): Promise<IAudioMetadata | undefined> {
    try {
      const embeddedData = await this.parseMetaData(filePath);
      return trackId === undefined
        ? embeddedData
        : await this.indexFileService.applyCustomTrackData(trackId, embeddedData);
    } catch (error) {
      this.logger.error(`error reading metadata ${filePath}`, error);
      return undefined;
    }
  }

  /**
   * Indexes a single new or modified file, creating the track first if it is new.  If a new track cannot be
   * saved it is removed, otherwise it would be left looking up to date and never retried.
   * @param rootPath The indexer root path being scanned
   * @param file The file on disk
   * @param [existingTrackId] The ID of the track if the file is already indexed
   * @returns How the file was indexed, or `failed` if it was skipped
   * @throws If the track could not be saved
   */
  private async indexFile(
    rootPath: RootPathEntity,
    file: FileItem,
    existingTrackId?: number,
  ): Promise<'added' | 'updated' | 'failed'> {
    const { accountId } = rootPath;
    const relativePath = toRelativePath(rootPath.rootPath, file.path);
    const embeddedData = await this.readMetadata(file.path, existingTrackId);
    if (!embeddedData) {
      return 'failed';
    }
    let trackId = existingTrackId;
    if (trackId === undefined) {
      this.indexerLog.addLogEntry(accountId, rootPath.id, `found new track ${file.path}`);
      const album = await this.indexAlbumService.updateAlbum(
        rootPath,
        embeddedData,
        getAlbumPath(rootPath.rootPath, file.path),
        accountId,
      );
      if (!album) {
        this.indexerLog.addLogEntry(accountId, rootPath.id, `album not found for file ${file.path}`);
        return 'failed';
      }
      const track = await this.trackEntity.create({
        accountId,
        albumId: album.id,
        fileMtime: file.lastModified,
        filePath: relativePath,
        fileSize: file.size,
        fileType: basename(file.path).split('.').pop() || '',
        rootPathId: rootPath.id,
      } as TrackEntity);
      trackId = track.id;
    } else {
      this.indexerLog.addLogEntry(accountId, rootPath.id, `found modified track ${relativePath}`);
    }
    try {
      this.indexerLog.addLogEntry(accountId, rootPath.id, `saving track ${relativePath}`);
      await this.trackSynchronizer.syncTrack(accountId, trackId, embeddedData);
      await this.trackEntity.update(
        { fileMtime: file.lastModified, fileSize: file.size, filePath: relativePath },
        { where: { id: trackId } },
      );
    } catch (error) {
      if (existingTrackId === undefined) {
        await this.trackEntity.destroy({ where: { id: trackId } });
      }
      throw error;
    }
    return existingTrackId === undefined ? 'added' : 'updated';
  }
}
