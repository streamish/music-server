import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/update-shoutcast-station', () => {
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

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/update-shoutcast-station`, {
        params: {
          query: {
            id: 123,
          },
        },
        body: {
          title: 'Guest update',
          url: 'http://localhost:1234',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should return an error for an invalid URL', async () => {
      const station = await createStation('Invalid URL Station', 'http://example.com/');
      const stationId = station.data?.station?.id;
      if (!stationId) {
        throw new Error(`Failed to create test station`);
      }
      const { error } = await updateStation(stationId, 'Invalid URL Station', 'invalid-url');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR);
    });

    it('should return an error for an empty URL', async () => {
      const station = await createStation('Invalid URL Station', 'http://example.com/');
      const stationId = station.data?.station?.id;
      if (!stationId) {
        throw new Error(`Failed to create test station`);
      }
      const { error } = await updateStation(stationId, 'Invalid URL Station', '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR);
    });

    it('should return an error for a very long URL', async () => {
      const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=123`;
      const longUrl = url + 'a'.repeat(256);
      const station = await createStation('Invalid URL Station', url);
      const stationId = station.data?.station?.id;
      if (!stationId) {
        throw new Error(`Failed to create test station`);
      }
      const { error } = await updateStation(stationId, 'Invalid URL Station', longUrl);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR);
    });

    it('should return an error for an empty title', async () => {
      const title = `Updating to empty title ${Date.now()}`;
      const station = await createStation(title, 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123');
      const stationId = station.data?.station?.id;
      if (!stationId) {
        throw new Error(`Failed to create test station`);
      }
      const { error } = await updateStation(stationId, '', 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR);
    });

    it('should return an error for a very long title', async () => {
      const station = await createStation(
        'Station With Long Title',
        'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123',
      );
      const stationId = station.data?.station?.id;
      if (!stationId) {
        throw new Error(`Failed to create test station`);
      }
      const { error } = await updateStation(
        stationId,
        'Station With Long Title'.repeat(10),
        'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123',
      );
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR);
    });
  });

  describe('success', () => {
    it('should update an existing user-defined station', async () => {
      // create the station
      const title = `Test Updating Station ${Date.now()}`;
      const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
      const { data } = await createStation(title, url);
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

    it('should update an existing favorite station', async () => {
      // create the station
      const title = `Test Updating Station 2 ${Date.now()}`;
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
});
