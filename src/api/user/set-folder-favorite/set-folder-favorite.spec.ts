import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-folder-favorite', () => {
  let accountId: number;
  let userApi: UserApi;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PUT(`/api/user/set-folder-favorite`, {
        params: {
          query: {
            folder: '/Artist 1/Album 1',
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
    it('should reject invalid folder path', async () => {
      const { error } = await userApi.setFolderFavorite({ folder: '/Invalid/Folder/Path' });
      expect(error?.message[0]).toBe(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create favorite for the folder', async () => {
      // create the favorite
      const { error, data } = await userApi.setFolderFavorite({
        folder: '/Artist 1/Album 1',
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await userApi.listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(listFavoritesError).toBeUndefined();
      expect(listFavoritesData?.favorites.some((f) => f.folder?.fullPath === '/Artist 1/Album 1')).toBe(true);
    }, 120_000);
  });
});
