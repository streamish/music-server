import { type SynologyApiClient, createSynologyApi } from '../../test-helper';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum, components } from '../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/album.cgi', () => {
  let api: Awaited<SynologyApiClient>;

  beforeAll(async () => {
    api = await createSynologyApi();
  });

  async function listAlbums(filters: Record<string, string>, offset?: number, limit?: number) {
    const { data, error } = await api.POST('/webapi/AudioStation/album.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Album,
        method: SynologyMethodEnum.list,
        version: 1,
        library: SynologyLibraryEnum.all,
        offset: offset || 0,
        limit: limit || 100000,
        ...filters,
      },
    });
    const typedData = data as components['schemas']['SynologyAlbumResponseDto'];
    return {
      data: typedData,
      error,
      albums: typedData?.data.albums || [],
      total: typedData?.data.total || 0,
    };
  }

  it('should list albums by genre + artist', async () => {
    const { albums, total } = await listAlbums({ genre: 'Chanson', artist: 'Artist 3' });
    expect(total).toBe(2);
    expect(albums.length).toBe(2);
    expect(albums[0]?.name).toBe('Album 4');
    expect(albums[1]?.name).toBe('Album 5');
  });

  it('should paginate albums by genre + artist', async () => {
    const filter = { genre: 'Chanson', artist: 'Artist 3' };
    // page 1
    const { albums, total } = await listAlbums(filter, 0, 1);
    expect(total).toBe(2);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums(filter, 1, 1);
    expect(total2).toBe(2);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 5');
  });

  it('should list albums by genre', async () => {
    const { albums, total } = await listAlbums({ genre: 'Acid' });
    expect(total).toBe(1);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 1');
  });

  it('should paginate albums by genre', async () => {
    // page 1
    const { albums, total } = await listAlbums({ genre: 'Rock' }, 0, 1);
    expect(total).toBe(2);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 2');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ genre: 'Rock' }, 1, 1);
    expect(total2).toBe(2);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 4');
  });

  it('should list albums by default genre', async () => {
    const { albums, total } = await listAlbums({ genre: 'EDM' });
    expect(total).toBe(1);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
  });

  it('should paginate albums by default genre', async () => {
    // page 1
    const { albums, total } = await listAlbums({ genre: 'EDM' }, 0, 1);
    expect(total).toBe(1);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ genre: 'EDM' }, 1, 1);
    expect(total2).toBe(1);
    expect(albums2.length).toBe(0);
  });

  it('should list albums by multi-genre', async () => {
    const { albums, total } = await listAlbums({ genre: 'EDM/Dance' });
    expect(total).toBe(2);
    expect(albums.length).toBe(2);
    expect(albums[0]?.album_artist).toBe('Artist 1');
    expect(albums[0]?.name).toBe('Album 2');
    expect(albums[1]?.album_artist).toBe('Artist 3');
    expect(albums[1]?.name).toBe('Album 4');
  });

  it('should paginate albums by multi-genre', async () => {
    // page 1
    const { albums, total } = await listAlbums({ genre: 'EDM/Dance' }, 0, 1);
    expect(total).toBe(2);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 2');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ genre: 'EDM/Dance' }, 1, 1);
    expect(total2).toBe(2);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 4');
  });

  it('should list albums by composer', async () => {
    const { albums, total } = await listAlbums({ composer: 'Composer 4' });
    expect(total).toBe(2);
    expect(albums.length).toBe(2);
    expect(albums[1]?.name).toBe('Album 4');
    expect(albums[1]?.album_artist).toBe('Artist 3');
    expect(albums[0]?.name).toBe('Album 3');
    expect(albums[0]?.album_artist).toBe('Artist 2');
  });

  it('should paginate albums by composer', async () => {
    // page 1
    const { albums, total } = await listAlbums({ composer: 'Composer 4' }, 0, 1);
    expect(total).toBe(2);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 3');
    expect(albums[0]?.album_artist).toBe('Artist 2');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ composer: 'Composer 4' }, 1, 1);
    expect(total2).toBe(2);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 4');
    expect(albums2[0]?.album_artist).toBe('Artist 3');
  });

  it('should list albums by artist', async () => {
    const { albums, total } = await listAlbums({ artist: 'Artist 3' });
    expect(total).toBe(2);
    expect(albums.length).toBe(2);
    expect(albums[0]?.name).toBe('Album 4');
    expect(albums[0]?.album_artist).toBe('Artist 3');
    expect(albums[1]?.name).toBe('Album 5');
    expect(albums[1]?.album_artist).toBe('Artist 3');
  });

  it('should paginate albums by artist', async () => {
    // page 1
    const { albums, total } = await listAlbums({ artist: 'Artist 3' }, 0, 1);
    expect(total).toBe(2);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
    expect(albums[0]?.album_artist).toBe('Artist 3');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ artist: 'Artist 3' }, 1, 1);
    expect(total2).toBe(2);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 5');
    expect(albums2[0]?.album_artist).toBe('Artist 3');
  });

  it('should list albums by artist + default genre', async () => {
    const { albums } = await listAlbums({ artist: 'Artist 3', genre: 'EDM' });
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
    expect(albums[0]?.album_artist).toBe('Artist 3');
  });

  it('should paginate albums by artist + default genre', async () => {
    // page 1
    const { albums, total } = await listAlbums({ artist: 'Artist 3', genre: 'EDM' }, 0, 1);
    expect(total).toBe(1);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ artist: 'Artist 3', genre: 'EDM' }, 1, 1);
    expect(total2).toBe(1);
    expect(albums2.length).toBe(0);
  });

  it('should list albums by artist in genre', async () => {
    const { albums } = await listAlbums({ artist: 'Artist 3', genre: 'Chanson' });
    expect(albums.length).toBe(2);
    expect(albums[0]?.name).toBe('Album 4');
    expect(albums[0]?.album_artist).toBe('Artist 3');
    expect(albums[1]?.name).toBe('Album 5');
    expect(albums[1]?.album_artist).toBe('Artist 3');
  });

  it('should paginate albums by artist in genre', async () => {
    // page 1
    const { albums, total } = await listAlbums({ artist: 'Artist 3', genre: 'Chanson' }, 0, 1);
    expect(total).toBe(2);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 4');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({ artist: 'Artist 3', genre: 'Chanson' }, 1, 1);
    expect(total2).toBe(2);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 5');
  });

  it('should list all albums with no filters', async () => {
    const { albums } = await listAlbums({});
    expect(albums.length).toBe(5);
    expect(albums[0]?.name).toBe('Album 1');
    expect(albums[0]?.album_artist).toBe('Artist 1');
    expect(albums[1]?.name).toBe('Album 2');
    expect(albums[1]?.album_artist).toBe('Artist 1');
    expect(albums[2]?.name).toBe('Album 3');
    expect(albums[2]?.album_artist).toBe('Artist 2');
    expect(albums[3]?.name).toBe('Album 4');
    expect(albums[3]?.album_artist).toBe('Artist 3');
    expect(albums[4]?.name).toBe('Album 5');
    expect(albums[4]?.album_artist).toBe('Artist 3');
  });

  it('should paginate all albums with no filters', async () => {
    // page 1
    const { albums, total } = await listAlbums({}, 0, 1);
    expect(total).toBe(5);
    expect(albums.length).toBe(1);
    expect(albums[0]?.name).toBe('Album 1');
    expect(albums[0]?.album_artist).toBe('Artist 1');
    // page 2
    const { albums: albums2, total: total2 } = await listAlbums({}, 1, 1);
    expect(total2).toBe(5);
    expect(albums2.length).toBe(1);
    expect(albums2[0]?.name).toBe('Album 2');
    expect(albums2[0]?.album_artist).toBe('Artist 1');
    // page 3
    const { albums: albums3, total: total3 } = await listAlbums({}, 2, 1);
    expect(total3).toBe(5);
    expect(albums3.length).toBe(1);
    expect(albums3[0]?.name).toBe('Album 3');
  });
});
