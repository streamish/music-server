import {
  AuthenticatedApiClient,
  createAuthenticatedApi,
  emptyAuthToken,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/end-session', () => {
  const deleteAccounts: number[] = [];
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    const account = await testApi.createAccount();
    deleteAccounts.push(account.id);
    userApi = await createAuthenticatedApi(account.username, account.password);
  });

  afterAll(async () => {
    await testApi.deleteAccounts(deleteAccounts);
  });

  async function endSession() {
    return userApi.DELETE(`/api/user/end-session`, {
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/user/end-session`, {
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
    it('should end session', async () => {
      const { error } = await endSession();
      expect(error).toBeUndefined();
      // verify the existing session is now invalid
      const { error: error2 } = await userApi.GET('/api/user/list-albums', {
        ...emptyAuthToken,
      });
      const typedError = error2 as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });
});
