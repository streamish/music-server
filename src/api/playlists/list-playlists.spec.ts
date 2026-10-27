import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { SmartPlaylistConjugalEnum, SmartPlaylistFieldEnum, SmartPlaylistOperationEnum } from '../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/list-playlists', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let otherUserApi: AuthenticatedApiClient;
  let otherAccountId: number;
  let normalPlaylistId: number;
  let smartPlaylistId: number;

  async function listPlaylists(api: AuthenticatedApiClient, offset?: number, limit?: number) {
    return api.GET(`/api/list-playlists`, {
      params: {
        query: {
          offset,
          limit,
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
    const { data: normalData } = await userApi.POST(`/api/create-playlist`, { body: { name: 'a-normal' } });
    const { data: smartData } = await userApi.POST(`/api/create-smart-playlist`, {
      body: {
        name: 'b-smart',
        rulesConjugal: SmartPlaylistConjugalEnum.or,
        rules: [
          {
            field: SmartPlaylistFieldEnum.genre,
            operation: SmartPlaylistOperationEnum.is,
            value: 'Rock',
          },
        ],
      },
    });
    if (!normalData?.playlistId || !smartData?.playlistId) {
      throw new Error('Failed to create playlists');
    }
    normalPlaylistId = normalData.playlistId;
    smartPlaylistId = smartData.playlistId;
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
    await testApi.deleteAccount(otherAccountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/list-playlists`, {});
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should not list another user playlists', async () => {
      const { error, data } = await listPlaylists(otherUserApi);
      expect(error).toBeUndefined();
      expect(data?.total).toBe(0);
      expect(data?.playlists).toHaveLength(0);
    });
  });

  describe('errors', () => {
    it('should reject invalid limit', async () => {
      const { error } = await listPlaylists(userApi, 0, 0);
      expect(error?.message).toContain(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await listPlaylists(userApi, -1, 10);
      expect(error?.message).toContain(ErrorCodes.INVALID_OFFSET_ERROR);
    });
  });

  describe('success', () => {
    it('should list normal and smart playlists with rules for smart playlists', async () => {
      const { error, data } = await listPlaylists(userApi);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.total).toBe(2);
      const normal = data?.playlists.find((p) => p.id === normalPlaylistId);
      expect(normal?.name).toBe('a-normal');
      expect(normal?.type).toBe('normal');
      expect(normal?.rules).toBeUndefined();
      const smart = data?.playlists.find((p) => p.id === smartPlaylistId);
      expect(smart?.type).toBe('smart');
      expect(smart?.rulesConjugal).toBe(SmartPlaylistConjugalEnum.or);
      expect(smart?.rules).toHaveLength(1);
      expect(smart?.rules?.[0]?.field).toBe(SmartPlaylistFieldEnum.genre);
      expect(smart?.rules?.[0]?.operation).toBe(SmartPlaylistOperationEnum.is);
      expect(smart?.rules?.[0]?.value).toBe('Rock');
    });

    it('should paginate playlists', async () => {
      const { error, data } = await listPlaylists(userApi, 1, 1);
      expect(error).toBeUndefined();
      expect(data?.total).toBe(2);
      expect(data?.limit).toBe(1);
      expect(data?.offset).toBe(1);
      expect(data?.playlists).toHaveLength(1);
      expect(data?.playlists[0]?.id).toBe(smartPlaylistId);
    });
  });
});
