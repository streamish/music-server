import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, describe, expect, it } from '@jest/globals';
import { testApi, unauthenticatedApi } from '../../../test-helper';

describe('/api/guest/create-session', () => {
  const deleteAccounts: number[] = [];

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function createSession(username: string, password: string, expiresDays?: number) {
    return unauthenticatedApi.POST('/api/guest/create-session', {
      body: {
        username,
        password,
        ...(expiresDays !== undefined ? { expiresDays } : {}),
      },
    });
  }

  describe('errors', () => {
    it('should reject missing username', async () => {
      const { error } = await createSession('', 'test123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
    });

    it('should reject invalid username length', async () => {
      const { error } = await createSession('x'.repeat(256), 'test123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_LENGTH_ERROR);
    });

    it('should reject missing password', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createSession(testUsername, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createSession(testUsername, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid expiration', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createSession(testUsername, 'password', 'invalid' as unknown as number);
      expect(error?.message).toContain(ErrorCodes.INVALID_EXPIRES_AT_ERROR);
    });

    it('should reject negative expiration', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createSession(testUsername, 'password', -1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR);
    });

    it('should reject too-long expiration', async () => {
      const testUsername = `username-${Date.now()}`;
      const { error } = await createSession(testUsername, 'password', 65000);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR);
    });
  });

  describe('success', () => {
    it('should create session', async () => {
      const account = await testApi.createAccount();
      const { error, data } = await createSession(account.username, account.password);
      expect(error).toBeUndefined();
      expect(data?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
