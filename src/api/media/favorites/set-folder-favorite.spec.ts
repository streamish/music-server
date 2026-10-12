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
      const { data: listFavoritesData } = await listFavorites();
      const favoriteItem = listFavoritesData?.favorites.find((item) => item.id === data?.favoriteId);
      if (!favoriteItem) {
        throw new Error('Favorite item not found');
      }
      expect(favoriteItem.folder?.fullPath).toBe('/Artist 1/Album 1');
      // verify the item is favorited
      type FolderDto =
        paths['/api/folder-structure']['get']['responses']['200']['content']['application/json']['items'][number];
      const { data: folderStructure2 } = await userApi.GET('/api/folder-structure');
      function findFolderStruture(items: FolderDto[]) {
        for (let i = 0, len = items.length; i < len; i += 1) {
          const child = items[i];
          if (child) {
            if (child.fullPath === '/Artist 1/Album 1') {
              return child;
            }
            if (child.children) {
              const result = findFolderStruture(child.children);
              if (result) {
                return result;
              }
            }
          }
        }
        return undefined;
      }
      const folderNow = findFolderStruture(folderStructure2?.items || []);
      expect(folderNow?.favoriteId).toBe(favoriteItem.id);
    });
  });
});
