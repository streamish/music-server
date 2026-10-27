import { describe, expect, it } from '@jest/globals';
import { detectChanges } from './change-detector';
import type { FileItem } from './types';

const root = '/music';
const date = new Date(2020, 0, 1);

function file(path: string, lastModified = date): FileItem {
  return { path: `${root}${path}`, lastModified, size: 1 };
}

describe('detectChanges', () => {
  it('should classify added, modified, unchanged and deleted files', () => {
    const result = detectChanges(
      root,
      [file('/new.mp3'), file('/same.mp3'), file('/changed.mp3', new Date(2021, 0, 1))],
      [
        { id: 1, filePath: '/same.mp3', fileMtime: date },
        { id: 2, filePath: '/changed.mp3', fileMtime: date },
        { id: 3, filePath: '/gone.mp3', fileMtime: date },
      ],
    );
    expect(result.added.map((item) => item.path)).toEqual(['/music/new.mp3']);
    expect(result.modified.map((item) => item.trackId)).toEqual([2]);
    expect(result.deletedTrackIds).toEqual([3]);
    expect(result.unchanged).toBe(1);
  });

  it('should delete duplicate rows for the same path', () => {
    const result = detectChanges(
      root,
      [file('/a.mp3')],
      [
        { id: 1, filePath: '/a.mp3', fileMtime: date },
        { id: 2, filePath: '/a.mp3', fileMtime: date },
      ],
    );
    expect(result.deletedTrackIds).toEqual([2]);
    expect(result.unchanged).toBe(1);
  });

  it('should handle nothing on disk', () => {
    const result = detectChanges(root, [], [{ id: 1, filePath: '/a.mp3', fileMtime: date }]);
    expect(result.deletedTrackIds).toEqual([1]);
  });
});
