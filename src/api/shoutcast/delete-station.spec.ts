import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
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

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/delete-shoutcast-station`, {
        params: {
          query: {
            id: 123,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should return an error for deleting an invalid station', async () => {
      const { error } = await deleteStation(0);
      expect(error?.message?.[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_ID_ERROR);
    });

    it('should return an error for deleting a non-existent station', async () => {
      const { error } = await deleteStation(999999);
      expect(error?.message?.[0]).toBe(ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
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
});
