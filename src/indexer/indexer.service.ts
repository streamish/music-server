import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { FileItem, FileUpdateItem, LogEntry } from './types';
import { IAudioMetadata, IOptions } from 'src/types/music-metadata';
import { IndexAlbumService } from './index-album.service';
import { IndexAssociationService } from './index-association.service';
import { IndexFolderService } from './index-folders.service';
import { IndexTrackService } from './index-track.service';
import { IndexerConfigurationEntity, RootPathEntity, TrackEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';
import { basename, join, sep } from 'node:path';
import { promisify } from 'util';
import { readdir, stat } from 'node:fs';

const readDirAsync = promisify(readdir);
const statAsync = promisify(stat);
const validFiles = ['mp3', 'flac', 'ogg', 'm4a'];

@Injectable()
export class IndexerService {
  private readonly logger: Logger = new Logger(IndexerService.name);

  public readonly logs: LogEntry[] = [];

  private logSizeLimit: number = 1000;

  private parseMetaData!: (filePath: string, options?: IOptions) => Promise<IAudioMetadata>;

  constructor(
    private readonly indexAlbumService: IndexAlbumService,
    private readonly indexAssociationService: IndexAssociationService,
    private readonly indexFileService: IndexTrackService,
    private readonly indexFolderService: IndexFolderService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(IndexerConfigurationEntity)
    private readonly indexerConfigurationEntity: typeof IndexerConfigurationEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @InjectModel(SystemConfigurationEntity)
    private readonly systemConfigurationEntity: typeof SystemConfigurationEntity,
  ) {}

  async addLogEntry(accountId: number, rootPathId: number, message: string) {
    const logEntry: LogEntry = {
      accountId,
      rootPathId,
      message,
      date: new Date(),
    };
    this.logger.log(`[accountId: ${accountId} rootPathId: ${rootPathId}] ${message}`);
    this.logs.push(logEntry);
    while (this.logs.length > this.logSizeLimit) {
      this.logs.shift();
    }
  }

  setLogSizeLimit(limit: number): void {
    this.logSizeLimit = limit;
    while (this.logs.length > this.logSizeLimit) {
      this.logs.shift();
    }
  }

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
   * Performs a full scan of a root path and its nested contents and then examines
   * files for additions or modifications and synchronizes the database
   * @param rootPath The indexer root path being scanned
   */
  async scanRootPath(rootPath: RootPathEntity) {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    await this.addLogEntry(rootPath.accountId, rootPath.id, `scanning root path `);
    const filesToScan: FileItem[] = [];
    const filesToUpdate: FileUpdateItem[] = [];
    const uniqueFolderPaths: string[] = [rootPath.rootPath];
    // start the path scanning to recursively identify all the files within the root path
    const scanCompleted = await this.scanFolderContents(rootPath, [rootPath.rootPath], filesToScan, uniqueFolderPaths);
    // an interrupted scan has an incomplete file list, so deleting "missing" tracks would remove valid ones
    if (!scanCompleted) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'folder scan was interrupted, skipping synchronization');
      return;
    }
    await this.addLogEntry(
      rootPath.accountId,
      rootPath.id,
      `root path contains ${uniqueFolderPaths.length} folders with ${filesToScan.length} files`,
    );
    // remove deleted folders and files from the database
    const deletedFiles = await this.trackEntity.destroy({
      where: {
        accountId: rootPath.accountId,
        rootPathId: rootPath.id,
        filePath: {
          [Op.notIn]: filesToScan.map((file) => file.path.substring(rootPath.rootPath.length)),
        },
      },
    });
    if (deletedFiles) {
      await this.addLogEntry(
        rootPath.accountId,
        rootPath.id,
        `deleted ${deletedFiles} stale file references from the database`,
      );
    }
    // start the file scanning to recursively identify all new or modified files
    await this.checkFile(rootPath, filesToScan, filesToUpdate);
    // start the metadata scanning to update the database with the latest file information
    await this.updateFile(rootPath, filesToUpdate);
    // update the folder index after scanning files
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
      attributes: ['filePath', 'rootPathId', 'fileSize'],
    });
    if (!file) {
      throw new Error(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const rootPath = await this.rootPathEntity.findByPk(file.rootPathId);
    if (!rootPath) {
      throw new Error(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    const filePath = join(rootPath.rootPath, file.filePath);
    const filesToScan = [
      {
        path: filePath,
        lastModified: new Date(1970, 0, 1),
        size: file.fileSize,
      },
    ];
    const filesToUpdate: FileUpdateItem[] = [];
    await this.checkFile(rootPath, filesToScan, filesToUpdate, true);
    const fileToUpdate = filesToUpdate[0];
    if (!fileToUpdate) {
      throw new Error(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const { embeddedData } = fileToUpdate;
    const albumPath = filePath.replace(rootPath.rootPath, '').split(sep).slice(0, 3).join(sep);
    await this.indexAlbumService.updateAlbum(rootPath, embeddedData, albumPath, rootPath.accountId);
    const track = await this.indexFileService.updateTrack(embeddedData, trackId, rootPath.accountId);
    await this.indexAssociationService.updateAssociations(
      embeddedData,
      rootPath.accountId,
      AssociationTypeEnum.ARTIST,
      track,
    );
    await this.indexAssociationService.updateAssociations(
      embeddedData,
      rootPath.accountId,
      AssociationTypeEnum.COMPOSER,
      track,
    );
    await this.indexAssociationService.updateAssociations(
      embeddedData,
      rootPath.accountId,
      AssociationTypeEnum.GENRE,
      track,
    );
    await this.indexAssociationService.syncAlbumAssociations(track.albumId);
  }

  /**
   * Recursively scans the root path and any subfolders for audio files
   * @param rootPath The indexer root path being scanned
   * @param foldersToScan Array of folders identified during the scan
   * @param filesToScan Array of files identified during the scan
   * @param uniqueFolderPaths Array of unique folder paths identified during the scan
   * @returns `true` if every folder was scanned, `false` if the scan was interrupted
   */
  async scanFolderContents(
    rootPath: RootPathEntity,
    foldersToScan: string[],
    filesToScan: FileItem[],
    uniqueFolderPaths: string[],
  ): Promise<boolean> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return false;
    }
    if (!foldersToScan.length) {
      return true;
    }
    const folderPath = foldersToScan.shift();
    if (!folderPath) {
      return true;
    }
    const folderContents = await readDirAsync(folderPath);
    for (let i = 0, len = folderContents.length; i < len; i += 1) {
      const fileName = folderContents[i];
      if (fileName) {
        const filePath = join(folderPath, fileName);
        // eslint-disable-next-line no-await-in-loop
        const contentStat = await statAsync(filePath);
        if (contentStat.isDirectory()) {
          foldersToScan.push(filePath);
          if (!uniqueFolderPaths.includes(filePath)) {
            uniqueFolderPaths.push(filePath);
          }
        } else if (contentStat.isFile()) {
          const fileType = fileName.toLowerCase().split('.').pop() || '';
          if (validFiles.includes(fileType.toLowerCase())) {
            filesToScan.push({
              path: filePath,
              lastModified: contentStat.mtime,
              size: contentStat.size,
            });
          }
        }
      }
    }
    return this.scanFolderContents(rootPath, foldersToScan, filesToScan, uniqueFolderPaths);
  }

  /**
   * Recursively checks files to determine if they need to be added or updated in the database
   * @param rootPath The indexer root path being scanned
   * @param filesToScan Array of files to be scanned
   * @param filesToUpdate Array of files that have been added or modified
   * @param [overrideScannerStatus] Optional flag to ensure a scan occurs on manual changes
   */
  async checkFile(
    rootPath: RootPathEntity,
    filesToScan: FileItem[],
    filesToUpdate: FileUpdateItem[],
    overrideScannerStatus?: boolean,
  ) {
    if (overrideScannerStatus !== true && (await this.isDisabled())) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    if (!filesToScan.length) {
      return;
    }
    const fileItem = filesToScan.shift();
    if (!fileItem) {
      return;
    }
    const { path: filePath, lastModified } = fileItem;
    const relativePath = filePath.substring(rootPath.rootPath.length);
    // get the album for the file
    const fileName = basename(filePath);
    const albumPath = filePath.replace(rootPath.rootPath, '').split(sep).slice(0, 3).join(sep);
    // check if the file exists in the database and is up to date
    const existingFile = await this.indexFileService.retrieveLastModified(rootPath.accountId, relativePath);
    if (!existingFile || existingFile.fileMtime.getTime() !== lastModified.getTime()) {
      // get the idv3 information from the file
      let embeddedData: IAudioMetadata;
      try {
        embeddedData = await this.parseMetaData(filePath);
        if (existingFile) {
          embeddedData = await this.indexFileService.applyCustomTrackData(existingFile.id, embeddedData);
        }
      } catch (error) {
        this.logger.error(`error reading metadata ${filePath}`, error);
        // skip only this file, the remaining files must still be checked
        await this.checkFile(rootPath, filesToScan, filesToUpdate);
        return;
      }
      if (!existingFile) {
        // add new track
        await this.addLogEntry(rootPath.accountId, rootPath.id, `found new track ${filePath}`);
        const album = await this.indexAlbumService.updateAlbum(rootPath, embeddedData, albumPath, rootPath.accountId);
        if (!album) {
          await this.addLogEntry(rootPath.accountId, rootPath.id, `album not found for file ${filePath}`);
          await this.checkFile(rootPath, filesToScan, filesToUpdate);
          return;
        }
        // if it doesn't exist add it to the database
        const newFile = await this.trackEntity.create({
          accountId: rootPath.accountId,
          albumId: album.id,
          fileMtime: lastModified,
          filePath: relativePath,
          fileSize: fileItem.size,
          fileType: fileName.split('.').pop() || '',
          rootPathId: rootPath.id,
        } as TrackEntity);
        filesToUpdate.push({
          embeddedData,
          trackId: newFile.id,
          lastModified,
          path: relativePath,
          size: fileItem.size,
        });
      } else if (existingFile.fileMtime.getTime() !== lastModified.getTime()) {
        await this.addLogEntry(rootPath.accountId, rootPath.id, `found modified track ${relativePath}`);
        // if it exists but the last-modified is different update it
        filesToUpdate.push({
          embeddedData,
          trackId: existingFile.id,
          lastModified,
          path: relativePath,
          size: fileItem.size,
        });
      }
    }
    await this.checkFile(rootPath, filesToScan, filesToUpdate);
  }

  /**
   * Recursively updates files until the queue is exhausted.  Each update will scan the file
   * for its IDv3 data and then synchronous the database with those values.
   * @param rootPath The indexer root path being scanned
   * @param filesToUpdate Array of files that have been added or modified
   */
  async updateFile(rootPath: RootPathEntity, filesToUpdate: FileUpdateItem[]) {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    if (!filesToUpdate.length) {
      return;
    }
    const fileItem = filesToUpdate.shift();
    if (!fileItem) {
      return;
    }
    await this.synchronizeFile(
      rootPath,
      fileItem.embeddedData,
      fileItem.trackId,
      fileItem.path,
      fileItem.size,
      fileItem.lastModified,
    );
    await this.updateFile(rootPath, filesToUpdate);
  }

  /**
   * Copies the IDv3 data from the file to the database and updates the file's last-modified date
   * @param rootPath The indexer root path being scanned
   * @param embeddedData The IDv3 data extracted from the file
   * @param trackId The ID of the file in the database
   * @param relativePath The path to the file on disk
   * @param fileSize The size of the file
   * @param fileMtime The last-modified date of the file
   */
  async synchronizeFile(
    rootPath: RootPathEntity,
    embeddedData: IAudioMetadata,
    trackId: number,
    relativePath: string,
    fileSize: number,
    fileMtime: Date,
  ) {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    await this.addLogEntry(rootPath.accountId, rootPath.id, `saving track ${relativePath}`);
    const track = await this.indexFileService.updateTrack(embeddedData, trackId, rootPath.accountId);
    await this.indexAssociationService.updateAssociations(
      embeddedData,
      rootPath.accountId,
      AssociationTypeEnum.ARTIST,
      track,
    );
    await this.indexAssociationService.updateAssociations(
      embeddedData,
      rootPath.accountId,
      AssociationTypeEnum.COMPOSER,
      track,
    );
    await this.indexAssociationService.updateAssociations(
      embeddedData,
      rootPath.accountId,
      AssociationTypeEnum.GENRE,
      track,
    );
    await this.indexAssociationService.syncAlbumAssociations(track.albumId);
    await this.trackEntity.update(
      {
        fileMtime,
        fileSize,
        filePath: relativePath,
      },
      {
        where: {
          id: trackId,
        },
      },
    );
  }
}
