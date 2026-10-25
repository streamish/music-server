import { FolderEntity, RootPathEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { access, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class IndexFolderService {
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
  private static async scanPath(path: string, rootPath: string, folderContents: string[]): Promise<string[]> {
    const foldersToScan = [path];
    for (let i = 0; i < foldersToScan.length; i += 1) {
      const currentPath = foldersToScan[i];
      if (currentPath) {
        const relativePath = currentPath.substring(rootPath.length) || '/';
        // eslint-disable-next-line no-await-in-loop
        const items = await readdir(currentPath);
        // eslint-disable-next-line no-await-in-loop
        const itemStats = await Promise.all(items.map((item) => stat(join(currentPath, item))));
        items.forEach((item, itemIndex) => {
          if (itemStats[itemIndex]?.isDirectory()) {
            const absolutePath = join(currentPath, item);
            folderContents.push(join(relativePath, item));
            foldersToScan.push(absolutePath);
          }
        });
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
    const folderContents: string[] = ['/'];
    await IndexFolderService.scanPath(rootPath.rootPath, rootPath.rootPath, folderContents);
    // index the paths that were found to identify new and existing entries
    for (let i = 0, len = folderContents.length; i < len; i += 1) {
      const folderPath = folderContents[i];
      if (folderPath) {
        const existingItem = existingIndex[folderPath];
        if (!existingItem) {
          // eslint-disable-next-line no-await-in-loop
          await this.folderEntity.create({
            accountId: rootPath.accountId,
            folderPath,
          } as FolderEntity);
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
            // eslint-disable-next-line no-await-in-loop
            if (await IndexFolderService.pathExists(combined)) {
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

  private static async pathExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? error.code : undefined;
      if (code === 'ENOENT' || code === 'ENOTDIR') {
        return false;
      }
      throw error;
    }
  }
}
