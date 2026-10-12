import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/set-track-favorite', () => {
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

  async function listTracks() {
    return userApi.GET('/api/list-tracks', {
      params: {
        query: {
          offset: 0,
          limit: 100_000,
        },
      },
    });
  }

  async function setTrackFavorite(id: number) {
    return userApi.PUT('/api/set-track-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-track-favorite`, {
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid track id', async () => {
      const { error } = await setTrackFavorite(-1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TRACK_ID_ERROR);
    });

    it('should reject nonexistent track id', async () => {
      const { error } = await setTrackFavorite(999999);
      expect(error?.message[0]).toBe(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should create favorite for the track', async () => {
      const { data: trackData } = await listTracks();
      const track = trackData?.tracks[0];
      if (!track) {
        throw new Error('Track not found');
      }
      // create the favorite
      const { error, data } = await setTrackFavorite(track.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { data: listFavoritesData } = await listFavorites();
      const favoriteItem = listFavoritesData?.favorites.find((item) => item.id === data?.favoriteId);
      if (!favoriteItem) {
        throw new Error('Favorite item not found');
      }
      expect(favoriteItem.track?.id).toBe(track.id);
      // verify the item is favorited
      const { data: tracks2 } = await userApi.GET('/api/list-tracks', {
        params: {
          query: {
            offset: 0,
            limit: 1,
          },
        },
      });
      const trackNow = tracks2?.tracks.find((item) => item.id === track.id);
      expect(trackNow?.favoriteId).toBe(favoriteItem.id);
    });
  });
});
