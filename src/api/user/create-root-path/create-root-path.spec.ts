import { AuthenticatedApiClient, createAuthenticatedApi, testApi, unauthenticatedApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/user/create-root-path', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    userApi = await createAuthenticatedApi();
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

  async function listRootPaths() {
    return userApi.GET(`/api/user/list-root-paths`, {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const newRootPath = join(tmpdir(), `test-guest-create-unauthorized-access-${Date.now()}`);
      const { error } = await unauthenticatedApi.POST(`/api/user/create-root-path`, {
        body: {
          rootPath: newRootPath,
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid path', async () => {
      const invalidPath = join(tmpdir(), `test-create-invalid-${Date.now()}`);
      const { error } = await createRootPath(invalidPath);
      expect(error?.message?.[0]).toBe(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    });
  });

  describe('success', () => {
    it('should create a new root path for the account', async () => {
      const account = await testApi.createAccount();
      // create the path
      const originalRootPath = join(tmpdir(), `test-new-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { data } = await createRootPath(originalRootPath);
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await listRootPaths();
      const rootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(rootPath).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
