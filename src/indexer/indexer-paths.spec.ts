import { describe, expect, it } from '@jest/globals';
import { getAlbumPath, toRelativePath } from './indexer-paths';

describe('indexer paths', () => {
  it('should make paths relative to the root', () => {
    expect(toRelativePath('/music', '/music/Artist/Album/01.mp3')).toBe('/Artist/Album/01.mp3');
  });

  it('should use artist and album folders as the album path', () => {
    expect(getAlbumPath('/music', '/music/Artist/Album/01.mp3')).toBe(
      getAlbumPath('/music', '/music/Artist/Album/CD 1/01.mp3'),
    );
    expect(getAlbumPath('/music', '/music/Artist/Album/01.mp3')).not.toBe(
      getAlbumPath('/music', '/music/Artist/Other/01.mp3'),
    );
  });
});
