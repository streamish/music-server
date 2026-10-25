import { SubsonicApiClient, createSubsonicApi } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { components } from '../../../types/api-schema';

describe('/rest/getMusicFolders', () => {
  let api: SubsonicApiClient;

  beforeAll(async () => {
    api = await createSubsonicApi();
  });

  it('should return the configured music folder', async () => {
    const { data } = await api.GET('/rest/getMusicFolders');
    const body = data as components['schemas']['SubsonicMusicFoldersResponseDto'];
    expect(data).toBeDefined();
    expect(body['subsonic-response']).toMatchObject({
      status: 'ok',
      musicFolders: {
        musicFolder: {
          id: 0,
          name: 'Music',
        },
      },
    });
  });
});
