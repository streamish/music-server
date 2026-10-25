import { SubsonicAlbumListTypeEnum, paths } from '../../../types/api-schema';
import { SubsonicApiClient, createSubsonicApi } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/rest/getAlbum', () => {
  let api: SubsonicApiClient;
  let albumId: string;

  async function getAlbum(id: string) {
    const { data, error } = await api.GET('/rest/getAlbum', {
      params: {
        query: {
          id,
        },
      } as never,
    });
    if (!data) {
      throw new Error('No data returned from getAlbum');
    }
    const typedData = data as paths['/rest/getAlbum']['get']['responses']['200']['content']['application/json'];
    return { data: typedData['subsonic-response'], error };
  }

  beforeAll(async () => {
    api = await createSubsonicApi();
    const { data } = await api.GET('/rest/getAlbumList2', {
      params: {
        query: {
          type: SubsonicAlbumListTypeEnum.alphabeticallyByArtist,
          currpage: 0,
          pagesize: 100_000,
        },
      } as never,
    });
    const typedData = data as paths['/rest/getAlbumList2']['get']['responses']['200']['content']['application/json'];
    const album = typedData['subsonic-response'].albumList2.album.find(({ name }) => name === 'Album 1');
    if (!album) {
      throw new Error('Album 1 was not returned by getAlbumList2');
    }
    albumId = album.id;
  });

  it('should return an album and its tracks', async () => {
    const { data, error } = await getAlbum(albumId);
    const { album } = data;
    expect(error).toBeUndefined();
    expect(data.status).toBe('ok');
    expect(album).toMatchObject({
      id: albumId,
      name: 'Album 1',
      songCount: 5,
    });
    expect(album.song.map((song) => song.title)).toContain('01 First Track');
  });

  it('should report an unknown album', async () => {
    const { data } = await getAlbum('2147483647');
    expect(data).toMatchObject({
      status: 'failed',
      error: { code: 70, message: expect.any(String) },
    });
  });
});
