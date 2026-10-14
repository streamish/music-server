import { AuthenticatedApiClient, USER_PASSWORD, createAuthenticatedApi, testApi } from '../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/shoutcast/delete-station', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `delete-station-${Date.now()}`;
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

  async function createStation(title: string, url: string, favorite: boolean) {
    return api.POST('/api/create-shoutcast-station', {
      body: {
        title,
        url,
        favorite,
      },
    });
  }

  async function deleteStation(id: number) {
    return api.DELETE('/api/delete-shoutcast-station', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function listStations() {
    return api.GET('/api/list-shoutcast-stations');
  }

  it('should delete an existing user-defined station', async () => {
    // create the station
    const title = `Test Deleting User-Defined Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    const { data } = await createStation(title, url, false);
    const id = data?.station?.id;
    if (!id) {
      throw new Error(`Failed to create test station`);
    }
    // delete the station
    await deleteStation(id);
    // verify delete
    const { data: updatedData } = await listStations();
    expect(updatedData?.stations.some((item) => item.title === title && item.url === url)).toBe(false);
  });

  it('should delete an existing favorite station', async () => {
    // create the station
    const title = `Test Deleting Favorite Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    const { data } = await createStation(title, url, true);
    const id = data?.station?.id;
    if (!id) {
      throw new Error(`Failed to create test station`);
    }
    // delete the station
    await deleteStation(id);
    // verify delete
    const { data: updatedData } = await listStations();
    expect(updatedData?.stations.some((item) => item.title === title && item.url === url)).toBe(false);
  });
});
