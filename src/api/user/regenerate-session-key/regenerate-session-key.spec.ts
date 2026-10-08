import {
  AuthenticatedApiClient,
  createAuthenticatedApi,
  emptyAuthToken,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/regenerate-session-key', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    const account = await testApi.createAccount();
    userApi = await createAuthenticatedApi(account.username, account.password);
    deleteAccounts.push(account.id);
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function regenerateSessionKey() {
    return userApi.POST('/api/user/regenerate-session-key', {
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/user/regenerate-session-key`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should generate new user session key', async () => {
      const { error, data } = await regenerateSessionKey();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      const { error: error2 } = await userApi.GET('/api/user/list-root-paths', {
        ...emptyAuthToken,
      });
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });
});
