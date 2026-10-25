import { SubsonicApiClient, createSubsonicApi } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { paths } from '../../../types/api-schema';

describe('/rest/getMusicFolders', () => {
  let api: SubsonicApiClient;

  beforeAll(async () => {
    api = await createSubsonicApi();
  });

  it('should return the configured music folder', async () => {
    const { data } = await api.GET('/rest/getMusicFolders');
    expect(data).toBeDefined();
    const typedData = data as paths['/rest/getMusicFolders']['get']['responses']['200']['content']['application/json'];
    expect(typedData['subsonic-response']).toMatchObject({
      status: 'ok',
      version: '1.16.1',
      musicFolders: {
        musicFolder: [
          {
            id: 0,
            name: 'Music',
          },
        ],
      },
    });
  });
});
