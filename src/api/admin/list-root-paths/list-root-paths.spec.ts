import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/list-root-paths', () => {
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  async function listRootPaths() {
    return adminApi.GET('/api/admin/list-root-paths', {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/admin/list-root-paths`, {});
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.GET('/api/admin/list-root-paths', {});
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list root paths', async () => {
      const adminRootPaths = process.env.DEFAULT_ADMIN_ROOT_PATH?.split(',').map((path) => path.trim()) as string[];
      const userRootPaths = process.env.DEFAULT_USER_ROOT_PATH?.split(',').map((path) => path.trim()) as string[];
      const defaultRootPaths = [...(adminRootPaths || []), ...(userRootPaths || [])];
      const { error, data } = await listRootPaths();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.rootPaths.length).toBeGreaterThanOrEqual(defaultRootPaths.length);
      for (let i = 0; i < defaultRootPaths.length; i += 1) {
        const defaultRootPath = defaultRootPaths[i];
        const match = data?.rootPaths.find((rootPath) => rootPath.rootPath === defaultRootPath);
        expect(match).toBeDefined();
      }
    });
  });
});
