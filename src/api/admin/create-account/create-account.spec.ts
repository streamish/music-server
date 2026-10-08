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

describe('/api/admin/create-account', () => {
  const deleteAccounts: number[] = [];
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function createAccount(ownPassword: string, username: string, password: string, roles: UserRoleEnum[]) {
    const { error } = await adminApi.POST('/api/admin/create-account', {
      body: {
        adminPassword: ownPassword,
        username,
        password,
        roles,
      },
      ...emptyAuthToken,
    });
    if (error) {
      return {
        error,
        account: {
          id: 0,
        },
      };
    }
    return {
      error,
      ...(await testApi.retrieveAccount(username)),
    };
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/admin/create-account`, {
        body: {
          adminPassword: ADMIN_PASSWORD,
          username: 'testuser',
          password: 'testpassword',
          roles: [UserRoleEnum.admin],
        },
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const testUsername = `username-${Date.now()}`;
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.POST('/api/admin/create-account', {
        body: {
          adminPassword: ADMIN_PASSWORD,
          username: testUsername,
          password: 'test-123',
          roles: [UserRoleEnum.user],
        },
        ...emptyAuthToken,
      });
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing username', async () => {
      const { error } = await createAccount(ADMIN_PASSWORD, '', 'test123', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
    });

    it('should reject invalid username length', async () => {
      const { error } = await createAccount(ADMIN_PASSWORD, 'x'.repeat(256), 'test123', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_LENGTH_ERROR);
    });

    it('should reject missing password', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createAccount(ADMIN_PASSWORD, testUsername, '', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createAccount(ADMIN_PASSWORD, testUsername, 'x'.repeat(256), [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });

    it('should reject no roles', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createAccount(ADMIN_PASSWORD, testUsername, 'test123', []);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USER_ROLE_ERROR);
    });

    it('should reject invalid roles', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createAccount(ADMIN_PASSWORD, testUsername, 'test123', ['invalidRole' as UserRoleEnum]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ROLE_ERROR);
    });

    it('should reject duplicate account', async () => {
      const username = `create-invalid-duplicate-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.user];
      const { account } = await createAccount(ADMIN_PASSWORD, username, password, roles);
      const { error } = await createAccount(ADMIN_PASSWORD, username, password, roles);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR);
      deleteAccounts.push(account?.id || 0);
    });

    it('should reject missing admin password', async () => {
      const username = `create-invalid-duplicate-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.user];
      const { error } = await createAccount('', username, password, roles);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    });

    it('should reject invalid admin password length', async () => {
      const username = `create-invalid-duplicate-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.user];
      const { error } = await createAccount('x'.repeat(256), username, password, roles);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid admin password', async () => {
      const username = `create-invalid-duplicate-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.user];
      const { error } = await createAccount('wrong-password', username, password, roles);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    });
  });

  describe('success', () => {
    it('should create a new administrator account', async () => {
      const username = `create-new-administrator-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.admin];
      await createAccount(ADMIN_PASSWORD, username, password, roles);
      const account = await testApi.retrieveAccount(username);
      expect(account.roles.length).toBe(1);
      expect(account.roles[0]).toBe(UserRoleEnum.admin);
      deleteAccounts.push(account.id);
    });

    it('should create a new user account', async () => {
      const username = `create-new-user-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.user];
      await createAccount(ADMIN_PASSWORD, username, password, roles);
      const account = await testApi.retrieveAccount(username);
      expect(account.roles.length).toBe(1);
      expect(account.roles[0]).toBe(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });

    it('should create a new administrator+user account', async () => {
      const username = `create-new-administrator+user-${Date.now()}`;
      const password = 'test123';
      const roles = [UserRoleEnum.admin, UserRoleEnum.user];
      await createAccount(ADMIN_PASSWORD, username, password, roles);
      const account = await testApi.retrieveAccount(username);
      expect(account.roles.length).toBe(2);
      expect(account.roles).toContain(UserRoleEnum.admin);
      expect(account.roles).toContain(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });
  });
});
