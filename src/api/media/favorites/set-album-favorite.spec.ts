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
import { paths } from 'src/types/api-schema';

describe('/api/set-album-favorite', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

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

  async function listAlbums(query: paths['/api/list-albums']['get']['parameters']['query']) {
    return userApi.GET('/api/list-albums', {
      params: {
        query,
      },
    });
  }

  async function listFavorites(query: paths['/api/list-favorites']['get']['parameters']['query']) {
    return userApi.GET('/api/list-favorites', {
      params: {
        query,
      },
    });
  }

  async function setAlbumFavorite(id: number) {
    return userApi.PUT('/api/set-album-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-album-favorite`, {
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
    it('should reject invalid album id', async () => {
      const { error } = await setAlbumFavorite(-1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ALBUM_ID_ERROR);
    });
  });

  describe('success', () => {
    it('should create favorite for the album', async () => {
      const { data: albumData } = await listAlbums({
        offset: 0,
        limit: 1,
      });
      const album = albumData?.albums[0];
      if (!album) {
        throw new Error('Album not found');
      }
      // create the favorite
      const { error, data } = await setAlbumFavorite(album.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(listFavoritesError).toBeUndefined();
      expect(listFavoritesData?.favorites.some((f) => f.album?.id === album.id)).toBe(true);
    });
  });
});
