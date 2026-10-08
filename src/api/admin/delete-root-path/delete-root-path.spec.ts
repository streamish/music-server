import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  emptyAuthToken,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/admin/delete-root-path', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function createRootPath(accountId: number, rootPath: string) {
    return adminApi.POST('/api/admin/create-root-path', {
      body: {
        rootPath,
      },
      params: {
        ...emptyAuthToken.params,
        query: {
          id: accountId,
        },
      },
    });
  }

  async function deleteRootPath(pathId: number) {
    return adminApi.DELETE('/api/admin/delete-root-path', {
      params: {
        ...emptyAuthToken.params,
        query: {
          id: pathId,
        },
      },
    });
  }

  async function listRootPaths() {
    return adminApi.GET('/api/admin/list-root-paths', {
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/admin/delete-root-path`, {
        params: {
          ...emptyAuthToken.params,
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.DELETE('/api/admin/delete-root-path', {
        params: {
          ...emptyAuthToken.params,
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
      const originalRootPath = join(tmpdir(), `test-delete-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const account = await testApi.createAccount();
      const { error: error2 } = await createRootPath(account.id, originalRootPath);
      expect(error2).toBeUndefined();
      const rootPathList = await listRootPaths();
      const rootPath = rootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // delete it
      const { error: error3, data } = await deleteRootPath(rootPath.id);
      expect(error3).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await listRootPaths();
      const deletedRootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(deletedRootPath).toBeUndefined();
      deleteAccounts.push(account.id);
    });
  });
});
