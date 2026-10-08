import {
  ADMIN_PASSWORD,
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  emptyAuthToken,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/delete-account', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function createAccount(adminPassword: string, username: string, password: string) {
    await adminApi.POST('/api/admin/create-account', {
      body: {
        adminPassword,
        username,
        password,
        roles: [UserRoleEnum.user],
      },
      ...emptyAuthToken,
    });
    return testApi.retrieveAccount(username);
  }

  async function deleteAccount(adminPassword: string, accountId: number) {
    return adminApi.PATCH('/api/admin/delete-account', {
      body: {
        adminPassword,
      },
      params: {
        ...emptyAuthToken.params,
        query: {
          id: accountId,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/admin/delete-account`, {
        body: {
          adminPassword: ADMIN_PASSWORD,
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
      const userApi = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await userApi.PATCH('/api/admin/delete-account', {
        body: {
          adminPassword: ADMIN_PASSWORD,
        },
        params: {
          ...emptyAuthToken.params,
          query: {
            id: 2,
          },
        },
      });
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await deleteAccount(ADMIN_PASSWORD, 0);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject only administrator', async () => {
      await testApi.extraAdminsCleared();
      const users = await testApi.listAccounts();
      const adminUser = users.find((user) => user.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin account found');
      }
      const { error } = await deleteAccount(ADMIN_PASSWORD, adminUser.id);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });

    it('should reject missing admin password', async () => {
      const account = await createAccount(ADMIN_PASSWORD, `testuser-${Date.now()}`, 'password');
      const { error } = await deleteAccount('', account.id);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid admin password length', async () => {
      const account = await createAccount(ADMIN_PASSWORD, `testuser-${Date.now()}`, 'password');
      const { error } = await deleteAccount('x'.repeat(256), account.id);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid admin password', async () => {
      const account = await createAccount(ADMIN_PASSWORD, `testuser-${Date.now()}`, 'password');
      const { error } = await deleteAccount('wrong-password', account.id);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
      deleteAccounts.push(account.id);
    });
  });

  describe('success', () => {
    it('should delete an account successfully', async () => {
      const account = await createAccount(ADMIN_PASSWORD, `testuser-${Date.now()}`, 'password');
      // delete it
      const { error, data } = await deleteAccount(ADMIN_PASSWORD, account.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const users = await testApi.listAccounts();
      const deletedAccount = users.find((user) => user.username === account.username);
      expect(deletedAccount).toBeUndefined();
    });
  });
});
