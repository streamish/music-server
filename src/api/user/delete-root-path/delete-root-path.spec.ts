import { AuthenticatedApiClient, createAuthenticatedApi, testApi, unauthenticatedApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/user/delete-root-path', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    const account = await testApi.createAccount();
    deleteAccounts.push(account.id);
    userApi = await createAuthenticatedApi(account.username, account.password);
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function createRootPath(rootPath: string) {
    return userApi.POST(`/api/user/create-root-path`, {
      body: {
        rootPath,
      },
    });
  }

  async function deleteRootPath(id: number) {
    return userApi.DELETE(`/api/user/delete-root-path`, {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function listRootPaths() {
    return userApi.GET(`/api/user/list-root-paths`, {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/user/delete-root-path`, {
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
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
      // create a root path
      const originalRootPath = join(tmpdir(), `test-delete-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { error: error2 } = await createRootPath(originalRootPath);
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
    });
  });
});
