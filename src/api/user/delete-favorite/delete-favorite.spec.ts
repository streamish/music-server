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

describe('/api/user/delete-favorite', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  async function setAlbumFavorite(id: number) {
    return userApi.PUT(`/api/user/set-album-favorite`, {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function deleteFavorite(id: number) {
    return userApi.DELETE(`/api/user/delete-favorite`, {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function listFavorites() {
    return userApi.GET(`/api/user/list-favorites`, {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/user/delete-favorite`, {
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('errors', () => {
    it('should reject invalid album id', async () => {
      const { error } = await deleteFavorite(-1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should delete favorite for the album', async () => {
      const { data: albumData } = await userApi.GET(`/api/user/list-albums`, {});
      const album = albumData?.albums[0];
      if (!album) {
        throw new Error('Album not found');
      }
      // create the favorite
      const { error, data } = await setAlbumFavorite(album.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await listFavorites();
      expect(listFavoritesError).toBeUndefined();
      const favorite = listFavoritesData?.favorites.find((f) => f.album?.id === album.id);
      expect(favorite?.album?.id).toBe(album.id);
      // delete it
      const { error: deleteError, data: deleteData } = await deleteFavorite(favorite?.id || 0);
      expect(deleteError).toBeUndefined();
      expect(deleteData?.success).toBe(true);
      // verify deletion
      const { error: listFavoritesErrorAfterDelete, data: listFavoritesDataAfterDelete } = await listFavorites();
      expect(listFavoritesErrorAfterDelete).toBeUndefined();
      expect(listFavoritesDataAfterDelete?.favorites.some((f) => f.album?.id === album.id)).toBe(false);
    }, 120_000);
  });
});
