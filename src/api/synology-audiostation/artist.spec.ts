import { type SynologyApiClient, createSynologyApi } from '../../test-helper';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum, type components } from '../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/artist.cgi', () => {
  let api: Awaited<SynologyApiClient>;

  beforeAll(async () => {
    api = await createSynologyApi();
  });

  async function listArtists(filters: Record<string, string>, offset?: number, limit?: number) {
    const { data, error } = await api.POST('/webapi/AudioStation/artist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Artist,
        method: SynologyMethodEnum.list,
        version: 1,
        library: SynologyLibraryEnum.all,
        offset: offset || 0,
        limit: limit || 100000,
        ...filters,
      },
    });
    const typedData = data as components['schemas']['SynologyArtistResponseDto'];
    return {
      data: typedData,
      error,
      artists: typedData?.data.artists || [],
      total: typedData?.data.total || 0,
    };
  }

  it('should list artists by genre', async () => {
    const { artists } = await listArtists({ genre: 'Rock' });
    expect(artists.length).toBe(2);
    expect(artists[0]?.name).toBe('Artist 1');
    expect(artists[1]?.name).toBe('Artist 3');
  });

  it('should paginate artists by genre', async () => {
    // page 1
    const { artists, total } = await listArtists({ genre: 'Rock' }, 0, 1);
    expect(total).toBe(2);
    expect(artists.length).toBe(1);
    expect(artists[0]?.name).toBe('Artist 1');
    // page 2
    const { artists: artists2, total: total2 } = await listArtists({ genre: 'Rock' }, 1, 1);
    expect(total2).toBe(2);
    expect(artists2.length).toBe(1);
    expect(artists2[0]?.name).toBe('Artist 3');
  });

  it('should list all artists with no filters', async () => {
    const { artists } = await listArtists({});
    expect(artists.length).toBe(3);
    expect(artists[0]?.name).toBe('Artist 1');
    expect(artists[1]?.name).toBe('Artist 2');
    expect(artists[2]?.name).toBe('Artist 3');
  });

  it('should paginate all artists with no filters', async () => {
    // page 1
    const { artists, total } = await listArtists({}, 0, 1);
    expect(total).toBe(3);
    expect(artists.length).toBe(1);
    expect(artists[0]?.name).toBe('Artist 1');
    // page 2
    const { artists: artists2, total: total2 } = await listArtists({}, 1, 1);
    expect(total2).toBe(3);
    expect(artists2.length).toBe(1);
    expect(artists2[0]?.name).toBe('Artist 2');
    // page 3
    const { artists: artists3, total: total3 } = await listArtists({}, 2, 1);
    expect(total3).toBe(3);
    expect(artists3.length).toBe(1);
    expect(artists3[0]?.name).toBe('Artist 3');
  });

  it('should list artists in default genre', async () => {
    const { artists } = await listArtists({ genre: 'Ballad' });
    expect(artists.length).toBe(2);
    expect(artists[0]?.name).toBe('Artist 1');
    expect(artists[1]?.name).toBe('Artist 2');
  });

  it('should paginate artists in default genre', async () => {
    // page 1
    const { artists, total } = await listArtists({ genre: 'Ballad' }, 0, 1);
    expect(total).toBe(2);
    expect(artists.length).toBe(1);
    expect(artists[0]?.name).toBe('Artist 1');
    // page 2
    const { artists: artists2, total: total2 } = await listArtists({ genre: 'Ballad' }, 1, 1);
    expect(total2).toBe(2);
    expect(artists2.length).toBe(1);
    expect(artists2[0]?.name).toBe('Artist 2');
  });

  it('should list artists in multi-genre', async () => {
    const { artists } = await listArtists({ genre: 'EDM/Dance' });
    expect(artists.length).toBe(2);
    expect(artists[0]?.name).toBe('Artist 1');
    expect(artists[1]?.name).toBe('Artist 3');
  });

  it('should paginate artists in multi-genre', async () => {
    // page 1
    const { artists, total } = await listArtists({ genre: 'EDM/Dance' }, 0, 1);
    expect(total).toBe(2);
    expect(artists.length).toBe(1);
    expect(artists[0]?.name).toBe('Artist 1');
    // page 2
    const { artists: artists2, total: total2 } = await listArtists({ genre: 'EDM/Dance' }, 1, 1);
    expect(total2).toBe(2);
    expect(artists2.length).toBe(1);
    expect(artists2[0]?.name).toBe('Artist 3');
  });
});
