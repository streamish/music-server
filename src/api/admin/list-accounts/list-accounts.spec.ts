import {
  ADMIN_USERNAME,
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  emptyAuthToken,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/list-accounts', () => {
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  async function listAccounts() {
    return adminApi.GET('/api/admin/list-accounts', {
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/admin/list-accounts`, {
        params: {
          ...emptyAuthToken.params,
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.GET('/api/admin/list-accounts', {
        ...emptyAuthToken,
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list accounts', async () => {
      const { error, data } = await listAccounts();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.accounts.length).toBeGreaterThan(0);
      const admin = data?.accounts.find((user) => user.username === ADMIN_USERNAME);
      expect(admin).toBeDefined();
      expect(admin?.roles).toContain('admin');
      const normal = data?.accounts.find((user) => user.username === USER_USERNAME);
      expect(normal).toBeDefined();
      expect(normal?.roles).toContain('user');
    });
  });
});
