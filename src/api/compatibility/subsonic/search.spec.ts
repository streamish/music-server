import { SubsonicApiClient, createSubsonicApi } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { paths } from '../../../types/api-schema';

type SearchQueryDto = paths['/rest/search']['get']['parameters']['query'];

describe('/rest/search', () => {
  let api: SubsonicApiClient;

  beforeAll(async () => {
    api = await createSubsonicApi();
  });

  async function search(query: SearchQueryDto) {
    const { data, error } = await api.GET('/rest/search', {
      params: {
        query,
      } as never,
    });
    if (!data) {
      throw new Error('No data returned from search');
    }
    const typedData = data as paths['/rest/search']['get']['responses']['200']['content']['application/json'];
    return { data: typedData['subsonic-response'], error };
  }

  it('should find matching tracks', async () => {
    const { data, error } = await search({
      title: 'First Track',
    });
    const result = data.searchResult;
    expect(error).toBeUndefined();
    expect(data.status).toBe('ok');
    expect(result.totalHits).toBeGreaterThan(0);
    expect(result.match.some((track) => track.title.includes('First Track'))).toBe(true);
  });

  it('should return an empty result when there are no matches', async () => {
    const { data, error } = await search({
      title: 'no matching track',
    });
    expect(error).toBeUndefined();
    expect(data.status).toBe('ok');
    expect(data.searchResult).toMatchObject({
      totalHits: 0,
      match: [],
    });
  });
});
