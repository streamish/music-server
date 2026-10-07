import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/delete-favorite', () => {
  let accountId: number;
  let userApi: UserApi;
  let albumId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
    const { data } = await userApi.listAlbums({
      offset: 0,
      limit: 1,
    });
    const album = data?.albums[0];
    if (!album) {
      throw new Error('Album not found');
    }
    albumId = album.id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.DELETE(`/api/user/delete-favorite`, {
        params: {
          query: {
            id: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('errors', () => {
    it('should reject invalid album id', async () => {
      const { error } = await userApi.deleteFavorite({ id: -1 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FAVORITE_ITEM_ID_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should delete favorite for the album', async () => {
      // create the favorite
      const { error, data } = await userApi.setAlbumFavorite({ id: albumId });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await userApi.listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(listFavoritesError).toBeUndefined();
      const favorite = listFavoritesData?.favorites.find((f) => f.album?.id === albumId);
      expect(favorite?.album?.id).toBe(albumId);
      // delete it
      const { error: deleteError, data: deleteData } = await userApi.deleteFavorite({ id: favorite?.id || 0 });
      expect(deleteError).toBeUndefined();
      expect(deleteData?.success).toBe(true);
      // verify deletion
      const { error: listFavoritesErrorAfterDelete, data: listFavoritesDataAfterDelete } = await userApi.listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(listFavoritesErrorAfterDelete).toBeUndefined();
      expect(listFavoritesDataAfterDelete?.favorites.some((f) => f.album?.id === albumId)).toBe(false);
    }, 120_000);
  });
});
