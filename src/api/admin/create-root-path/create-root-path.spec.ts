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

describe('/api/admin/create-root-path', () => {
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
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const newRootPath = join(tmpdir(), `test-guest-create-unauthorized-access-${Date.now()}`);
      const { error } = await unauthenticatedApi.POST(`/api/admin/create-root-path`, {
        body: {
          rootPath: newRootPath,
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
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const newRootPath = join(tmpdir(), `test-user-create-unauthorized-access-${Date.now()}`);
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.POST('/api/admin/create-root-path', {
        body: {
          rootPath: newRootPath,
        },
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
    it('should reject invalid account id', async () => {
      const { error } = await createRootPath(0, tmpdir());
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject invalid path', async () => {
      const invalidPath = join(tmpdir(), `test-create-invalid-${Date.now()}`);
      const { error } = await createRootPath(1, invalidPath);
      expect(error?.message?.[0]).toBe(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    });
  });

  describe('success', () => {
    it('should create a new root path for an account', async () => {
      const account = await testApi.createAccount();
      const originalRootPath = join(tmpdir(), `test-new-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { data } = await createRootPath(account.id, originalRootPath);
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await listRootPaths();
      const rootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(rootPath).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
