import {
  ADMIN_PASSWORD,
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/update-user-roles', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function updateUserRoles(accountId: number, adminPassword: string, roles: UserRoleEnum[]) {
    return adminApi.PATCH(`/api/admin/update-user-roles`, {
      body: {
        adminPassword,
        roles,
      },
      params: {
        query: {
          id: accountId,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/admin/update-user-roles`, {
        body: {
          adminPassword: ADMIN_PASSWORD,
          roles: [UserRoleEnum.admin],
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
      const { error } = await nonAuthenticatedApiClient.PATCH('/api/admin/update-user-roles', {
        body: {
          adminPassword: ADMIN_PASSWORD,
          roles: [UserRoleEnum.admin],
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
      const { error } = await updateUserRoles(0, ADMIN_PASSWORD, [UserRoleEnum.user]);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ACCOUNT_ID_ERROR);
    });

    it('should reject nonexistent account id', async () => {
      const { error } = await updateUserRoles(999999, ADMIN_PASSWORD, [UserRoleEnum.user]);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject no roles', async () => {
      const account = await testApi.createAccount();
      const { error: updateError } = await updateUserRoles(account.id, ADMIN_PASSWORD, []);
      expect(updateError?.message[0]).toBe(ErrorCodes.INVALID_USER_ROLE_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid roles', async () => {
      const { error } = await updateUserRoles(1, ADMIN_PASSWORD, ['invalidRole' as UserRoleEnum]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ROLE_ERROR);
    });

    it(`should reject revoking only admin's role`, async () => {
      await testApi.extraAdminsCleared();
      const accounts = await testApi.listAccounts();
      const adminUser = accounts.find((a) => a.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin user found');
      }
      const { error } = await updateUserRoles(adminUser.id, ADMIN_PASSWORD, [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });

    it('should reject missing admin password', async () => {
      const { error } = await updateUserRoles(1, '', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    });

    it('should reject invalid admin password length', async () => {
      const { error } = await updateUserRoles(1, 'x'.repeat(256), [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid admin password', async () => {
      const { error } = await updateUserRoles(1, 'wrong-password', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    });
  });

  describe('success', () => {
    it('should update user roles', async () => {
      const username = `username-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.admin];
      const account = await testApi.createAccount(username, password, roles);
      // update it
      await updateUserRoles(account.id, ADMIN_PASSWORD, [UserRoleEnum.user]);
      // verify it
      const updatedAccounts = await testApi.listAccounts();
      const updatedAccount = updatedAccounts.find((a) => a.id === account.id);
      expect(updatedAccount).toBeDefined();
      expect(updatedAccount?.roles.length).toBe(1);
      expect(updatedAccount?.roles[0]).toBe(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });
  });
});
