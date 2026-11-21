import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  guestApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/update-username', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const account = await testApi.createAccount();
    userApi = await createAuthenticatedApi(account.username, USER_PASSWORD);
    username = account.username;
    password = USER_PASSWORD;
    deleteAccounts.push(account.id);
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function updateUsername(userPassword: string, newUsername: string) {
    return userApi.POST('/api/update-username', {
      body: {
        newUsername,
        userPassword,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/update-username`, {
        body: {
          newUsername: 'testusername',
          userPassword: 'testpassword',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing password', async () => {
      const { error } = await updateUsername(password, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
    });

    it('should reject invalid password length', async () => {
      const { error } = await updateUsername(password, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_LENGTH_ERROR);
    });

    it('should reject missing authorization password', async () => {
      const { error } = await updateUsername('', 'new-username');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USER_PASSWORD_ERROR);
    });

    it('should reject invalid authorization password length', async () => {
      const { error } = await updateUsername('x'.repeat(256), 'new-username');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USER_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid authorization password', async () => {
      const { error } = await updateUsername('wrong-password', 'new-username');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USER_PASSWORD_ERROR);
    });
  });

  describe('success', () => {
    it('should update username', async () => {
      // update their username
      const { data } = await updateUsername(password, 'new-username');
      expect(data?.success).toBe(true);
      // verify old does not work
      const { error: oldSessionError } = await guestApi.createSession(username, password);
      expect(oldSessionError?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
      // verify new does work
      const { data: newSession } = await guestApi.createSession('new-username', password);
      expect(newSession?.jwtToken).toBeDefined();
    });
  });
});
