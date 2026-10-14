import { AuthenticatedApiClient, USER_PASSWORD, createAuthenticatedApi, testApi } from '../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/create-shoutcast-station', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `create-station-user-${Date.now()}`;
    const account = await testApi.createAccount(username);
    accountId = account.id;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    api = await createAuthenticatedApi(username, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createStation(title: string, url: string, favorite = false) {
    return api.POST('/api/create-shoutcast-station', {
      body: {
        title,
        url,
        favorite,
      },
    });
  }

  async function listStations() {
    return api.GET('/api/list-shoutcast-stations');
  }

  it('should add a new user-defined station', async () => {
    const title = `Test User-Defined Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(title, url);
    const { data } = await listStations();
    expect(data?.stations.some((item) => item.title === title && item.url === url)).toBe(true);
  });

  it('should add a new favorite station', async () => {
    const title = `Test Adding Favorite Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createStation(title, url, true);
    const { data } = await listStations();
    expect(data?.stations.some((item) => item.title === title && item.url === url)).toBe(true);
  });
});
