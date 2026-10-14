import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/shoutcast/list-shoutcast-stations', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `list-stations-${Date.now()}`;
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
      const { error } = await unauthenticatedApi.GET(`/api/list-shoutcast-stations`);
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list all stations', async () => {
      const title1 = `Test List All Station 1 ${Date.now()}`;
      const url1 = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}&1=1`;
      const title2 = `Test List All Station 2 ${Date.now()}`;
      const url2 = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}&2=2`;
      const title3 = `Test List All Station 3 ${Date.now()}`;
      const url3 = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}&3=3`;
      await createStation(title1, url1);
      await createStation(title2, url2, true);
      await createStation(title3, url3);
      const { data } = await listStations();
      expect(data?.stations.some((item) => item.title === title1 && item.url === url1)).toBe(true);
      expect(data?.stations.some((item) => item.title === title2 && item.url === url2)).toBe(true);
      expect(data?.stations.some((item) => item.title === title3 && item.url === url3)).toBe(true);
    });
  });
});
