import { LibraryScannerService } from './library-scanner.service';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

describe('LibraryScannerService', () => {
  let tempDir: string;
  const scanner = new LibraryScannerService();
  const never = () => Promise.resolve(false);

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'scanner-spec-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should find supported files in nested folders and ignore others', async () => {
    await mkdir(join(tempDir, 'A', 'B'), { recursive: true });
    await writeFile(join(tempDir, 'A', 'B', '01.mp3'), 'x');
    await writeFile(join(tempDir, 'A', '02.FLAC'), 'x');
    await writeFile(join(tempDir, 'A', '02.lrc'), 'x');
    await writeFile(join(tempDir, 'cover.jpg'), 'x');
    const result = await scanner.scan(tempDir, never);
    expect(result.completed).toBe(true);
    expect(result.files.map((file) => file.path).sort()).toEqual([
      join(tempDir, 'A', '02.FLAC'),
      join(tempDir, 'A', 'B', '01.mp3'),
    ]);
    expect(result.files[0]!.size).toBe(1);
    expect(result.folderPaths).toHaveLength(3);
  });

  it('should report an interrupted scan', async () => {
    const result = await scanner.scan(tempDir, () => Promise.resolve(true));
    expect(result.completed).toBe(false);
  });

  it('should throw when the root does not exist', async () => {
    await expect(scanner.scan(join(tempDir, 'missing'), never)).rejects.toThrow();
  });

  it('should follow symlinks to files and skip broken ones', async () => {
    await writeFile(join(tempDir, 'real.mp3'), 'x');
    await symlink(join(tempDir, 'real.mp3'), join(tempDir, 'link.mp3'));
    await symlink(join(tempDir, 'nothing.mp3'), join(tempDir, 'broken.mp3'));
    const result = await scanner.scan(tempDir, never);
    expect(result.files.map((file) => file.path).sort()).toEqual([
      join(tempDir, 'link.mp3'),
      join(tempDir, 'real.mp3'),
    ]);
  });
});
