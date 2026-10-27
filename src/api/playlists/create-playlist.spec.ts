import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/create-playlist', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createPlaylist(name: string) {
    return userApi.POST(`/api/create-playlist`, {
      body: {
        name,
      },
    });
  }

  async function deletePlaylist(id: number) {
    return userApi.DELETE(`/api/delete-playlist`, {
      params: {
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/create-playlist`, {
        body: {
          name: 'playlist',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject empty name', async () => {
      const { error } = await createPlaylist('');
      expect(error?.message).toContain(ErrorCodes.INVALID_NAME_ERROR);
    });

    it('should reject name that is too long', async () => {
      const { error } = await createPlaylist('a'.repeat(256));
      expect(error?.message).toContain(ErrorCodes.INVALID_NAME_LENGTH_ERROR);
    });
  });

  describe('success', () => {
    it('should create a normal playlist', async () => {
      const { error, data } = await createPlaylist(`playlist-${Date.now()}`);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.playlistId).toBeGreaterThan(0);
      // verify it exists by deleting it
      const { error: deleteError } = await deletePlaylist(data?.playlistId || 0);
      expect(deleteError).toBeUndefined();
    });
  });
});
