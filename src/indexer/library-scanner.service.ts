/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { join } from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import type { FileItem } from './types';

export const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'flac', 'ogg', 'm4a'];

/**
 * Walks a root path and finds the supported audio files within it.
 */
@Injectable()
export class LibraryScannerService {
  /**
   * Scans the root path and its subfolders.  Failure to read a folder fails the scan, but a file that
   * disappears while the scan is running or a broken link is skipped.
   * @param rootDir The root path to scan
   * @param shouldStop Called before each folder is read, returning `true` stops the scan
   */
  // eslint-disable-next-line class-methods-use-this
  async scan(rootDir: string, shouldStop: () => Promise<boolean>) {
    const files: FileItem[] = [];
    const folderPaths: string[] = [rootDir];
    const pending: string[] = [rootDir];
    for (let folderPath = pending.shift(); folderPath !== undefined; folderPath = pending.shift()) {
      if (await shouldStop()) {
        return { completed: false, files, folderPaths };
      }
      const entries = await readdir(folderPath, { withFileTypes: true });
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i]!;
        const entryPath = join(folderPath, entry.name);
        if (entry.isDirectory()) {
          pending.push(entryPath);
          folderPaths.push(entryPath);
        } else {
          const extension = entry.name.split('.').pop()?.toLowerCase() ?? '';
          if (entry.isSymbolicLink() || SUPPORTED_AUDIO_EXTENSIONS.includes(extension)) {
            try {
              const info = await stat(entryPath);
              if (info.isDirectory()) {
                pending.push(entryPath);
                folderPaths.push(entryPath);
              } else if (info.isFile() && SUPPORTED_AUDIO_EXTENSIONS.includes(extension)) {
                files.push({ path: entryPath, lastModified: info.mtime, size: info.size });
              }
            } catch (error) {
              if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
                throw error;
              }
            }
          }
        }
      }
    }
    return { completed: true, files, folderPaths };
  }
}
