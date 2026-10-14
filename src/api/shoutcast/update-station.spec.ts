import { AuthenticatedApiClient, USER_PASSWORD, createAuthenticatedApi, testApi } from '../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/shoutcast/list-online-shoutcast-stations', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `update-stations-user-${Date.now()}`;
    const account = await testApi.createAccount(username);
    accountId = account.id || 0;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    api = await createAuthenticatedApi(username, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createStation(title: string, url: string, favorite: boolean = false) {
    return api.POST('/api/create-shoutcast-station', {
      body: {
        title,
        url,
        favorite,
      },
    });
  }

  async function updateStation(id: number, title: string, url: string) {
    return api.PATCH('/api/update-shoutcast-station', {
      params: {
        query: {
          id,
        },
      },
      body: {
        title,
        url,
      },
    });
  }

  async function listStations() {
    return api.GET('/api/list-shoutcast-stations');
  }

  it('should update an existing user-defined station', async () => {
    // create the station
    const title = `Test Updating User-Defined Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    const { data } = await createStation(title, url);
    const id = data?.station?.id;
    if (!id) {
      throw new Error(`Failed to create test station`);
    }
    // get the station index
    const updatedTitle = `${title} - Updated`;
    const updatedUrl = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await updateStation(id, updatedTitle, updatedUrl);
    // verify update
    const { data: updatedList } = await listStations();
    expect(updatedList?.stations.some((item) => item.title === updatedTitle && item.url === updatedUrl)).toBe(true);
  });

  it('should update an existing favorite station', async () => {
    // create the station
    const title = `Test Updating Favorite Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    const { data } = await createStation(title, url, true);
    const id = data?.station?.id;
    if (!id) {
      throw new Error(`Failed to create test station`);
    }
    // update the station
    const updatedTitle = `${title} - Updated`;
    const updatedUrl = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await updateStation(id, updatedTitle, updatedUrl);
    // verify update
    const { data: updatedList } = await listStations();
    expect(updatedList?.stations.some((item) => item.title === updatedTitle && item.url === updatedUrl)).toBe(true);
  });
});
