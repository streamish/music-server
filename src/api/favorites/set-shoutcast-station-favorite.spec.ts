import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/set-shoutcast-station-favorite', () => {
  let accountId: number;
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createStation(title: string, url: string, favorite: boolean) {
    return userApi.POST('/api/create-shoutcast-station', {
      body: {
        title,
        url,
        favorite,
      },
    });
  }

  async function listFavorites() {
    return userApi.GET('/api/list-favorites', {
      params: {
        query: {
          offset: 0,
          limit: 100_000,
        },
      },
    });
  }

  async function listShoutcastStations() {
    return userApi.GET('/api/list-shoutcast-stations');
  }

  async function setShoutcastStationFavorite(shoutcastStationId?: number, shoutcastStationUrl?: string) {
    return userApi.PUT('/api/set-shoutcast-station-favorite', {
      params: {
        query: {
          shoutcastStationId,
          shoutcastStationUrl,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-shoutcast-station-favorite`, {
        params: {
          query: {
            shoutcastStationId: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid station id', async () => {
      const { error } = await setShoutcastStationFavorite(-1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_ID_ERROR);
    });

    it('should reject nonexistent station id', async () => {
      const { error } = await setShoutcastStationFavorite(999999);
      expect(error?.message[0]).toBe(ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR);
    });

    it('should reject invalid station url', async () => {
      const { error } = await setShoutcastStationFavorite(undefined, 'invalid-url');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR);
    });

    it('should reject very long station url', async () => {
      const { error } = await setShoutcastStationFavorite(undefined, `http://123.123.123.123/${'a'.repeat(256)}`);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_STATION_URL_LENGTH_ERROR);
    });
  });

  describe('success', () => {
    it('should create favorite for existing shoutcast station', async () => {
      const { data: stationData } = await createStation(
        `Station ${Date.now()}`,
        `http://example.com/stream/${Date.now()}`,
        false,
      );
      const station = stationData?.station;
      if (!station?.id) {
        throw new Error('Failed to create station');
      }
      // create the favorite
      const { error, data } = await setShoutcastStationFavorite(station.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { data: listFavoritesData } = await listFavorites();
      const favoriteItem = listFavoritesData?.favorites.find((item) => item.shoutcastStation?.id === station.id);
      if (!favoriteItem) {
        throw new Error('Favorite item not found');
      }
      expect(favoriteItem.shoutcastStation?.id).toBe(station.id);
      // verify the item is favorite'd
      const { data: shoutcastStations2 } = await listShoutcastStations();
      const shoutcastStationNow = shoutcastStations2?.stations.find((item) => item.id === station.id);
      expect(shoutcastStationNow?.favoriteId).toBe(favoriteItem.id);
    });

    it('should create favorite for online shoutcast station', async () => {
      const stationUrl = `http://example.com/stream/${Date.now()}`;
      // create the favorite
      const { error, data } = await setShoutcastStationFavorite(undefined, stationUrl);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { data: listFavoritesData } = await listFavorites();
      const favoriteItem = listFavoritesData?.favorites.find((item) => item.shoutcastStation?.url === stationUrl);
      if (!favoriteItem) {
        throw new Error('Favorite item not found');
      }
      expect(favoriteItem.shoutcastStation?.url).toBe(stationUrl);
      // verify the station exists
      const { data: shoutcastStations2 } = await listShoutcastStations();
      const shoutcastStationNow = shoutcastStations2?.stations.find((item) => item.url === stationUrl);
      expect(shoutcastStationNow?.favoriteId).toBe(favoriteItem.id);
    });
  });
});
