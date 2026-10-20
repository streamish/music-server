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

describe('/users/list-folder-contents', () => {
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

  async function listFolderContents(path: string = '/') {
    return userApi.GET('/api/list-folder-contents', {
      params: {
        query: {
          path,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET('/api/list-folder-contents', {
        params: {
          query: {
            path: '/',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should return nested folder list', async () => {
      const { data } = await listFolderContents();
      const artist1 = data?.folder.children?.[0];
      const artist2 = data?.folder.children?.[1];
      const artist3 = data?.folder.children?.[2];
      expect(data?.folder.children?.length).toBe(3);
      expect(artist1?.folder).toBe('Artist 1');
      expect(artist2?.folder).toBe('Artist 2');
      expect(artist3?.folder).toBe('Artist 3');
    });

    it('should return file list', async () => {
      const { data } = await listFolderContents('/Artist 1/Album 1');
      const files = data?.folder.children;
      expect(files?.length).toBe(5);
      for (let i = 0; i < (files?.length ?? 0); i += 1) {
        expect(files?.[i]?.track?.id).toBeDefined();
      }
    });
  });
});
