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

describe('/api/set-folder-favorite', () => {
  let accountId: number;
  let userApi: AuthenticatedApiClient;
  let folderId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const folders = await userApi.GET('/api/list-folder-contents', {
      params: {
        query: {
          path: '/',
        },
      },
    });
    if (!folders.data?.folder?.id) {
      throw new Error('Folder not found');
    }
    folderId = folders.data?.folder?.id;
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

  async function setFolderFavorite(id: number) {
    return userApi.PUT('/api/set-folder-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-folder-favorite`, {
        params: {
          query: {
            id: folderId,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid folder ID', async () => {
      const { error } = await setFolderFavorite(9999);
      expect(error?.message[0]).toBe(ErrorCodes.FOLDER_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should create favorite for the folder', async () => {
      // create the favorite
      const { error, data } = await setFolderFavorite(folderId);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { data: listFavoritesData } = await listFavorites();
      const favoriteItem = listFavoritesData?.favorites.find((item) => item.id === data?.favoriteId);
      if (!favoriteItem) {
        throw new Error('Favorite item not found');
      }
      expect(favoriteItem.folder?.id).toBe(folderId);
      // verify the item is favorited
      const { data: folderStructure2 } = await userApi.GET('/api/list-folder-contents', {
        params: {
          query: {
            path: '/',
          },
        },
      });
      const folderNow = folderStructure2?.folder;
      expect(folderNow?.favoriteId).toBe(favoriteItem.id);
    });
  });
});
