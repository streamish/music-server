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

describe('/api/delete-user-root-path', () => {
  const deleteAccounts: number[] = [];
  let accountId: number;
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    const newUsername = `delete-root-pathj-user-${Date.now()}`;
    const account = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    accountId = account.data?.account.accountId || 0;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    deleteAccounts.push(accountId);
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function deleteRootPath(rootPathId: number) {
    return adminApi.DELETE('/api/delete-user-root-path', {
      params: {
        query: {
          id: rootPathId,
        },
      },
    });
  }

  async function listRootPaths(id: number) {
    return adminApi.GET('/api/list-user-root-paths', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/delete-user-root-path`, {
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.DELETE('/api/delete-user-root-path', {
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid path id', async () => {
      const { error } = await deleteRootPath(1234567890);
      expect(error?.message[0]).toBe(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should delete a root path', async () => {
      const rootPathList = await listRootPaths(accountId);
      const rootPath = rootPathList.data?.rootPaths[0];
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // delete it
      const { error: error3, data } = await deleteRootPath(rootPath.id);
      expect(error3).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await listRootPaths(accountId);
      const deletedRootPath = updatedRootPathList.data?.rootPaths.find((path) => path.id === rootPath.id);
      expect(deletedRootPath).toBeUndefined();
    });
  });
});
