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

describe('/api/admin/update-root-path', () => {
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

  async function listRootPaths() {
    return adminApi.GET('/api/admin/list-root-paths', {
      params: {
        ...emptyAuthToken.params,
      },
    });
  }

  async function updateRootPath(rootPathId: number, newPath: string) {
    return adminApi.PATCH('/api/admin/update-root-path', {
      body: {
        newPath,
      },
      params: {
        ...emptyAuthToken.params,
        query: {
          id: rootPathId,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/admin/update-root-path`, {
        body: {
          newPath: tmpdir(),
        },
        params: {
          query: {
            id: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.PATCH('/api/admin/update-root-path', {
        body: {
          newPath: tmpdir(),
        },
        params: {
          ...emptyAuthToken.params,
          query: {
            id: 1,
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid root path id', async () => {
      const { error } = await updateRootPath(0, tmpdir());
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR);
    });

    it('should reject missing root path', async () => {
      const { error } = await updateRootPath(1, '');
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ROOT_PATH_ERROR);
    });

    it('should reject invalid root path', async () => {
      const invalidPath = join(tmpdir(), `test-update-invalid-${Date.now()}`);
      const nonexistentPath = join(tmpdir(), invalidPath);
      const { error } = await updateRootPath(1, nonexistentPath);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    });
  });

  describe('success', () => {
    it('should update root path', async () => {
      const account = await testApi.createAccount();
      const originalRootPath = join(tmpdir(), `test-update-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { error: error2 } = await createRootPath(account.id, originalRootPath);
      expect(error2).toBeUndefined();
      const rootPathList = await listRootPaths();
      const rootPath = rootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // update it
      const newRootPath = join(tmpdir(), `test-updated-root-path-${Date.now()}`);
      mkdirSync(newRootPath, { recursive: true });
      const { error: error3 } = await updateRootPath(rootPath.id, newRootPath);
      expect(error3).toBeUndefined();
      // verify it
      const rootPathList2 = await listRootPaths();
      const rootPath2 = rootPathList2.data?.rootPaths.find((path) => path.rootPath === newRootPath);
      expect(rootPath2).toBeDefined();
      expect(rootPath2?.id).toBe(rootPath?.id);
      expect(rootPath2?.rootPath).toBe(newRootPath);
      deleteAccounts.push(account.id);
    });
  });
});
