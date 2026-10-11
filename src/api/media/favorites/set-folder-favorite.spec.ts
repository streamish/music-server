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

describe('/api/set-folder-favorite', () => {
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

  async function setFolderFavorite(folderPath: string) {
    return userApi.PUT('/api/set-folder-favorite', {
      params: {
        query: {
          folder: folderPath,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-folder-favorite`, {
        params: {
          query: {
            folder: '/Artist 1/Album 1',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid folder path', async () => {
      const { error } = await setFolderFavorite('/Invalid/Folder/Path');
      expect(error?.message[0]).toBe(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should create favorite for the folder', async () => {
      // create the favorite
      const { error, data } = await setFolderFavorite('/Artist 1/Album 1');
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await listFavorites();
      expect(listFavoritesError).toBeUndefined();
      expect(listFavoritesData?.favorites.some((f) => f.folder?.fullPath === '/Artist 1/Album 1')).toBe(true);
    });
  });
});
