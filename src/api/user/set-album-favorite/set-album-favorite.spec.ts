import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-album-favorite', () => {
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
      const { error } = await api.PUT(`/api/user/set-album-favorite`, {
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
      const { error } = await userApi.setAlbumFavorite({ id: -1 });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ALBUM_ID_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create favorite for the album', async () => {
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
      expect(listFavoritesData?.favorites.some((f) => f.album?.id === albumId)).toBe(true);
    }, 120_000);
  });
});
