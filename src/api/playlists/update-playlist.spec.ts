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

describe('/api/update-playlist', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let otherUserApi: AuthenticatedApiClient;
  let otherAccountId: number;
  let playlistId: number;

  async function createPlaylist(name: string) {
    return userApi.POST(`/api/create-playlist`, {
      body: {
        name,
      },
    });
  }

  async function updatePlaylist(api: AuthenticatedApiClient, id: number, name: string) {
    return api.PATCH(`/api/update-playlist`, {
      params: {
        query: {
          id,
        },
      },
      body: {
        name,
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
    const { data } = await createPlaylist('original');
    if (!data?.playlistId) {
      throw new Error('Failed to create playlist');
    }
    playlistId = data.playlistId;
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
    await testApi.deleteAccount(otherAccountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/update-playlist`, {
        params: {
          query: {
            id: 1,
          },
        },
        body: {
          name: 'renamed',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should not update another user playlist', async () => {
      const { error } = await updatePlaylist(otherUserApi, playlistId, 'stolen');
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid playlist id', async () => {
      const { error } = await updatePlaylist(userApi, -1, 'renamed');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject empty name', async () => {
      const { error } = await updatePlaylist(userApi, playlistId, '');
      expect(error?.message).toContain(ErrorCodes.INVALID_NAME_ERROR);
    });

    it('should reject missing playlist', async () => {
      const { error } = await updatePlaylist(userApi, 999_999_999, 'renamed');
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should update the playlist name', async () => {
      const { error, data } = await updatePlaylist(userApi, playlistId, 'renamed');
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });
  });
});
