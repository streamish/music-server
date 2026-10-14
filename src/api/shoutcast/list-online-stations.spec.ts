import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/shoutcast/list-online-shoutcast-stations', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `list-online-stations-${Date.now()}`;
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

  async function listOnlineStations(genreId: number) {
    return api.GET('/api/list-online-shoutcast-stations', {
      params: {
        query: {
          id: genreId,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/list-online-shoutcast-stations`, {
        params: {
          query: {
            id: 123,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list all online SHOUTcast stations', async () => {
      const genres = await api.GET('/api/list-shoutcast-genres');
      const genreId = genres.data?.genres?.[0]?.id;
      if (!genreId) {
        throw new Error(`No genres available for testing`);
      }
      const { data } = await listOnlineStations(genreId);
      expect(data?.stations.length).toBeGreaterThan(0);
      expect(data?.stations.every((item) => item.type === 'station')).toBe(true);
      expect(data?.stations.every((item) => item.url?.length > 0)).toBe(true);
    });
  });
});
