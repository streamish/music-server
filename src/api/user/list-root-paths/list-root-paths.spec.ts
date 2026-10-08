import {
  AuthenticatedApiClient,
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

describe('/api/user/list-root-paths', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    const account = await testApi.createAccount();
    userApi = await createAuthenticatedApi(account.username, account.password);
    deleteAccounts.push(account.id);
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function createRootPath(rootPath: string) {
    return userApi.POST('/api/user/create-root-path', {
      ...emptyAuthToken,
      body: {
        rootPath,
      },
    });
  }

  async function listRootPaths() {
    return userApi.GET('/api/user/list-root-paths', {
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/user/list-root-paths`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list root paths', async () => {
      const testPath1 = join(tmpdir(), `test-list-root-paths-1-${Date.now()}`);
      const testPath2 = join(tmpdir(), `test-list-root-paths-2-${Date.now()}`);
      mkdirSync(testPath1);
      mkdirSync(testPath2);
      await createRootPath(testPath1);
      await createRootPath(testPath2);
      const { error, data } = await listRootPaths();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.rootPaths.length).toBe(2);
      const expectedRootPaths = [testPath1, testPath2];
      for (let i = 0; i < expectedRootPaths.length; i += 1) {
        const expectedRootPath = expectedRootPaths[i];
        const match = data?.rootPaths.find((rootPath) => rootPath.rootPath === expectedRootPath);
        expect(match).toBeDefined();
      }
    });
  });
});
