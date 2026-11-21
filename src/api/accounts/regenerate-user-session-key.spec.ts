import {
  ADMIN_PASSWORD,
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/regenerate-user-session-key', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function regenerateUserSessionKey(userId: number, adminPassword: string) {
    return adminApi.POST('/api/regenerate-user-session-key', {
      params: {
        query: {
          id: userId,
        },
      },
      body: {
        adminPassword,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/regenerate-user-session-key`, {
        params: {
          query: {
            id: 1,
          },
        },
        body: {
          adminPassword: ADMIN_PASSWORD,
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.POST('/api/regenerate-user-session-key', {
        params: {
          query: {
            id: 2,
          },
        },
        body: {
          adminPassword: ADMIN_PASSWORD,
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await regenerateUserSessionKey(0, ADMIN_PASSWORD);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ACCOUNT_ID_ERROR);
    });

    it('should reject nonexistent account id', async () => {
      const { error } = await regenerateUserSessionKey(99999, ADMIN_PASSWORD);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should generate new user session key', async () => {
      const account = await testApi.createAccount();
      const accountApi = await createAuthenticatedApi(account.username, USER_PASSWORD);
      const { error, data } = await regenerateUserSessionKey(account.id, ADMIN_PASSWORD);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify
      const { error: error2 } = await accountApi.GET('/api/list-root-paths', {});
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      deleteAccounts.push(account.id);
    });
  });
});
