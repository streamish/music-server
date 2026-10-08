import {
  ADMIN_PASSWORD,
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  guestApi,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/reset-user-password', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function resetUserPassword(userId: number, adminPassword: string, newPassword: string) {
    return adminApi.POST('/api/admin/reset-user-password', {
      body: {
        adminPassword,
        newPassword,
        password: adminPassword,
      },
      params: {
        query: {
          id: userId,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/admin/reset-user-password`, {
        body: {
          adminPassword: ADMIN_PASSWORD,
          newPassword: 'testpassword',
          password: ADMIN_PASSWORD,
        },
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
      const { error } = await nonAuthenticatedApiClient.POST('/api/admin/reset-user-password', {
        body: {
          adminPassword: ADMIN_PASSWORD,
          newPassword: 'test-123',
          password: ADMIN_PASSWORD,
        },
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
    it('should reject invalid account id', async () => {
      const { error } = await resetUserPassword(-1, ADMIN_PASSWORD, 'new-password');
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ACCOUNT_ID_ERROR);
    });

    it('should reject nonexistent account id', async () => {
      const { error } = await resetUserPassword(999999, ADMIN_PASSWORD, 'new-password');
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject missing password', async () => {
      const { error } = await resetUserPassword(1, ADMIN_PASSWORD, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_NEW_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const { error } = await resetUserPassword(1, ADMIN_PASSWORD, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_NEW_PASSWORD_LENGTH_ERROR);
    });

    it('should reject missing admin password', async () => {
      const { error } = await resetUserPassword(1, '', 'new-password');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    });

    it('should reject invalid admin password length', async () => {
      const { error } = await resetUserPassword(1, 'x'.repeat(256), 'new-password');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid admin password', async () => {
      const { error } = await resetUserPassword(1, 'wrong-password', 'new-password');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    });
  });

  describe('success', () => {
    it('should reset user password', async () => {
      const account = await testApi.createAccount();
      // reset their password
      const { data } = await resetUserPassword(account.id, ADMIN_PASSWORD, 'newpassword');
      expect(data?.success).toBe(true);
      // verify it
      const newSession = await guestApi.createSession(account.username, 'newpassword');
      expect(newSession.data?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
