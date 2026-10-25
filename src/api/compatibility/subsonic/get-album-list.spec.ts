import { SubsonicAlbumListTypeEnum, paths } from '../../../types/api-schema';
import { SubsonicApiClient, createSubsonicApi } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

type GetAlbumListQueryDto = paths['/rest/getAlbumList2']['get']['parameters']['query'];

describe('/rest/getAlbumList2', () => {
  let api: SubsonicApiClient;

  beforeAll(async () => {
    api = await createSubsonicApi();
  });

  async function getAlbumList(filters: GetAlbumListQueryDto, offset = 0, size = 100) {
    const { data, error } = await api.GET('/rest/getAlbumList2', {
      params: {
        query: {
          ...filters,
          currpage: filters.offset || offset,
          pagesize: filters.size || size,
        },
      } as never,
    });
    if (!data) {
      throw new Error('No data returned from getAlbumList');
    }
    return { data, error };
  }

  it('should return albums sorted alphabetically by name', async () => {
    const { data } = await getAlbumList({ type: SubsonicAlbumListTypeEnum.alphabeticallyByName });
    const albums = data['subsonic-response'].albumList2.album;
    expect(data['subsonic-response'].status).toBe('ok');
    expect(albums.map((album) => album.name)).toEqual(['Album 1', 'Album 2', 'Album 3', 'Album 4', 'Album 5']);
    expect(albums.every((album) => album.id.length > 0)).toBe(true);
  });

  it('should paginate albums', async () => {
    const { data: firstPage } = await getAlbumList({
      type: SubsonicAlbumListTypeEnum.alphabeticallyByName,
      size: 2,
      offset: 0,
    });
    const { data: secondPage } = await getAlbumList({
      type: SubsonicAlbumListTypeEnum.alphabeticallyByName,
      size: 2,
      offset: 2,
    });
    const firstPageAlbums = firstPage['subsonic-response'].albumList2.album;
    const secondPageAlbums = secondPage['subsonic-response'].albumList2.album;
    expect(firstPageAlbums).toHaveLength(2);
    expect(secondPageAlbums).toHaveLength(2);
    expect(
      firstPageAlbums.map((album) => album.id).some((id) => secondPageAlbums.some((album) => album.id === id)),
    ).toBe(false);
  });
});
