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

describe('/api/delete-playlist', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let otherUserApi: AuthenticatedApiClient;
  let otherAccountId: number;

  async function createPlaylist(name: string) {
    return userApi.POST(`/api/create-playlist`, {
      body: {
        name,
      },
    });
  }

  async function deletePlaylist(api: AuthenticatedApiClient, id: number) {
    return api.DELETE(`/api/delete-playlist`, {
      params: {
        query: {
          id,
        },
      },
    });
  }

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const otherUsername = `other-user-${Date.now()}`;
    const otherAccount = await testApi.duplicateAccount(USER_USERNAME, otherUsername);
    if (!otherAccount.data?.account.accountId) {
      throw new Error('Failed to create other account');
    }
    otherAccountId = otherAccount.data.account.accountId;
    otherUserApi = await createAuthenticatedApi(otherUsername, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
    await testApi.deleteAccount(otherAccountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/delete-playlist`, {
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should not delete another user playlist', async () => {
      const { data } = await createPlaylist('mine');
      const { error } = await deletePlaylist(otherUserApi, data?.playlistId || 0);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
      const { error: ownerError } = await deletePlaylist(userApi, data?.playlistId || 0);
      expect(ownerError).toBeUndefined();
    });
  });

  describe('errors', () => {
    it('should reject invalid playlist id', async () => {
      const { error } = await deletePlaylist(userApi, -1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject missing playlist', async () => {
      const { error } = await deletePlaylist(userApi, 999_999_999);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should delete a playlist', async () => {
      const { data } = await createPlaylist(`playlist-${Date.now()}`);
      const playlistId = data?.playlistId || 0;
      const { error, data: deleteData } = await deletePlaylist(userApi, playlistId);
      expect(error).toBeUndefined();
      expect(deleteData?.success).toBe(true);
      // verify deletion
      const { error: secondError } = await deletePlaylist(userApi, playlistId);
      expect(secondError?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });
  });
});
