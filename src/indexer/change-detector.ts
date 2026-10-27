import { toRelativePath } from './indexer-paths';
import type { FileItem, IndexedFile } from './types';

type ModifiedFile = {
  file: FileItem;
  trackId: number;
};

/**
 * Compares the files found on disk with the files already indexed for the same root path.
 * @param rootDir The root path that was scanned
 * @param scanned The files found on disk
 * @param indexed The files already in the database for the root path
 * @returns The files to add, the files whose modified date differs, the tracks whose files no longer exist
 * and the number of files that are up to date
 */
export function detectChanges(rootDir: string, scanned: FileItem[], indexed: IndexedFile[]) {
  const indexedByPath = new Map<string, IndexedFile>();
  indexed.forEach((item) => {
    if (!indexedByPath.has(item.filePath)) {
      indexedByPath.set(item.filePath, item);
    }
  });
  const matchedIds = new Set<number>();
  const added: FileItem[] = [];
  const modified: ModifiedFile[] = [];
  let unchanged = 0;
  scanned.forEach((file) => {
    const existing = indexedByPath.get(toRelativePath(rootDir, file.path));
    if (!existing) {
      added.push(file);
      return;
    }
    matchedIds.add(existing.id);
    if (existing.fileMtime.getTime() === file.lastModified.getTime()) {
      unchanged += 1;
    } else {
      modified.push({ file, trackId: existing.id });
    }
  });
  // anything not matched is gone from disk, including any duplicate rows for a path
  const deletedTrackIds = indexed.filter((item) => !matchedIds.has(item.id)).map((item) => item.id);
  return { added, modified, deletedTrackIds, unchanged };
}
