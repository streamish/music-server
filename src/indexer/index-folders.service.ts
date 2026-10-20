import { FolderEntity, RootPathEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class IndexFolderService {
  private readonly logger: Logger = new Logger(IndexFolderService.name);

  constructor(
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  /**
   * Recursively scans the given path for all folders and returns an array of all
   * folder paths found within the given path.
   * @param path The absolute path
   * @param rootPath The root path being scanned
   * @param folderContents An array to accumulate folder paths
   * @returns An array of all folder paths found within the given path.
   */
  scanPath(path: string, rootPath: string, folderContents: string[]): string[] {
    const relativePath = path.substring(rootPath.length) || '/';
    const items = readdirSync(path);
    for (let i = 0, len = items.length; i < len; i += 1) {
      const item = items[i];
      if (item) {
        const isDirectory = statSync(join(path, item)).isDirectory();
        if (isDirectory) {
          folderContents.push(join(relativePath, item));
          const absolutePath = join(path, item);
          this.scanPath(absolutePath, rootPath, folderContents);
        }
      }
    }
    return folderContents;
  }

  /**
   * Scans the folders within the given root path and synchronizes the database with the
   * updated folder structure.
   * @param rootPath The root path entity representing the base directory to scan.
   */
  async indexFolders(rootPath: RootPathEntity): Promise<void> {
    const existingFolders = await this.folderEntity.findAll({
      where: {
        accountId: rootPath.accountId,
      },
      raw: true,
    });
    const existingIndex: Record<string, FolderEntity> = {};
    for (let i = 0, len = existingFolders.length; i < len; i += 1) {
      const folder = existingFolders[i];
      if (folder) {
        existingIndex[folder.folderPath] = folder;
      }
    }
    // scan the root path folder structure recursively
    const activeIndex: Record<string, FolderEntity> = {};
    const folderContents: string[] = ['/'];
    this.scanPath(rootPath.rootPath, rootPath.rootPath, folderContents);
    // index the paths that were found to identify new and existing entries
    for (let i = 0, len = folderContents.length; i < len; i += 1) {
      const folderPath = folderContents[i];
      if (folderPath) {
        const existingItem = existingIndex[folderPath];
        if (existingItem) {
          activeIndex[folderPath] = existingItem;
        } else {
          // eslint-disable-next-line no-await-in-loop
          const newFolder = await this.folderEntity.create({
            accountId: rootPath.accountId,
            folderPath,
          } as FolderEntity);
          activeIndex[folderPath] = newFolder.get({ plain: true });
        }
      }
    }
    await this.removeObsoleteFolders(rootPath.accountId);
  }

  async removeObsoleteFolders(accountId: number) {
    const rootPaths = await this.rootPathEntity.findAll({
      where: {
        accountId,
      },
      raw: true,
    });
    const folders = await this.folderEntity.findAll({
      where: {
        accountId,
      },
      raw: true,
    });
    const deleteIds: number[] = [];
    for (let i = 0, len = folders.length; i < len; i += 1) {
      const folder = folders[i];
      if (folder) {
        let exists = false;
        for (let j = 0, jLen = rootPaths.length; j < jLen; j += 1) {
          const rootPath = rootPaths[j];
          if (rootPath) {
            const combined = join(rootPath.rootPath, folder.folderPath);
            if (existsSync(combined)) {
              exists = true;
              break;
            }
          }
        }
        if (!exists) {
          deleteIds.push(folder.id);
        }
      }
    }
    if (deleteIds.length) {
      await this.folderEntity.destroy({
        where: {
          id: deleteIds,
          accountId,
        },
      });
    }
  }
}
