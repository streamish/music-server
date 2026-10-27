import { sep } from 'node:path';

/**
 * Returns the path of a file relative to its root path, including the leading separator, which is
 * the form stored in the database.
 * @param rootDir The root path of the library
 * @param filePath The absolute path of a file within the root path
 */
export function toRelativePath(rootDir: string, filePath: string): string {
  return filePath.substring(rootDir.length);
}

/**
 * Returns the album folder for a file, which is the first two levels below the root path
 * (`/Artist/Album`).  Deeper folders such as `CD 1` are part of the same album.  A file placed
 * directly in the root path or an artist folder is its own album path.
 * @param rootDir The root path of the library
 * @param filePath The absolute path of a file within the root path
 */
export function getAlbumPath(rootDir: string, filePath: string): string {
  return toRelativePath(rootDir, filePath).split(sep).slice(0, 3).join(sep);
}
