import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
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

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/create-shoutcast-station`, {
        body: {
          title: 'Guest Station',
          url: 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123',
          favorite: false,
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should return an error for an invalid URL', async () => {
      const { error } = await createStation('Invalid URL Station', 'invalid-url');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR);
    });

    it('should return an error for an empty URL', async () => {
      const { error } = await createStation('Invalid URL Station', '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR);
    });

    it('should return an error for a very long URL', async () => {
      const longUrl = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${'a'.repeat(256)}`;
      const { error } = await createStation('Invalid URL Station', longUrl);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR);
    });

    it('should return an error for an empty title', async () => {
      const { error } = await createStation('', 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR);
    });

    it('should return an error for a very long title', async () => {
      const { error } = await createStation('x'.repeat(256), 'http://yp.shoutcast.com/sbin/tunein-station.pls?id=123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_TITLE_LENGTH_ERROR);
    });
  });

  describe('success', () => {
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
});
