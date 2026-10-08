import {
  AuthenticatedApiClient,
  createAuthenticatedApi,
  guestApi,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/update-password', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const account = await testApi.createAccount();
    userApi = await createAuthenticatedApi(account.username, account.password);
    username = account.username;
    password = account.password;
    deleteAccounts.push(account.id);
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function updatePassword(newPassword: string) {
    return userApi.POST('/api/user/update-password', {
      body: {
        newPassword,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/user/update-password`, {
        body: {
          newPassword: 'testpassword',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing password', async () => {
      const { error } = await updatePassword('');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const { error } = await updatePassword('x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });
  });

  describe('success', () => {
    it('should reset user password', async () => {
      // reset their password
      const { data } = await updatePassword('newpassword');
      expect(data?.success).toBe(true);
      // verify old does not work
      const { error: oldSessionError } = await guestApi.createSession(username, password);
      expect(oldSessionError?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
      // verify it
      const { data: newSession } = await guestApi.createSession(username, 'newpassword');
      expect(newSession?.jwtToken).toBeDefined();
    });
  });
});
