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

describe('/api/create-smart-playlist', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  const validRules = [
    {
      field: SmartPlaylistFieldEnum.genre,
      operation: SmartPlaylistOperationEnum.is,
      value: 'Rock',
    },
  ];

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

  async function createSmartPlaylist(
    name: string,
    rulesConjugal: SmartPlaylistConjugalEnum,
    rules: Record<string, unknown>[],
  ) {
    return userApi.POST(`/api/create-smart-playlist`, {
      body: {
        name,
        rulesConjugal,
        rules: rules as typeof validRules,
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
      const { error } = await unauthenticatedApi.POST(`/api/create-smart-playlist`, {
        body: {
          name: 'playlist',
          rulesConjugal: SmartPlaylistConjugalEnum.and,
          rules: validRules,
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject empty name', async () => {
      const { error } = await createSmartPlaylist('', SmartPlaylistConjugalEnum.and, validRules);
      expect(error?.message).toContain(ErrorCodes.INVALID_NAME_ERROR);
    });

    it('should reject invalid conjugal', async () => {
      const { error } = await createSmartPlaylist('playlist', 'xor' as SmartPlaylistConjugalEnum, validRules);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_RULES_CONJUGAL_ERROR);
    });

    it('should reject invalid rule field', async () => {
      const { error } = await createSmartPlaylist('playlist', SmartPlaylistConjugalEnum.and, [
        { ...validRules[0], field: 'nope' },
      ]);
      expect(error?.message).toContain(`rules.0.${ErrorCodes.INVALID_PLAYLIST_RULE_FIELD_ERROR}`);
    });

    it('should reject invalid rule operation', async () => {
      const { error } = await createSmartPlaylist('playlist', SmartPlaylistConjugalEnum.and, [
        { ...validRules[0], operation: 'nope' },
      ]);
      expect(error?.message).toContain(`rules.0.${ErrorCodes.INVALID_PLAYLIST_RULE_OPERATION_ERROR}`);
    });

    it('should reject empty rule value', async () => {
      const { error } = await createSmartPlaylist('playlist', SmartPlaylistConjugalEnum.and, [
        { ...validRules[0], value: '' },
      ]);
      expect(error?.message).toContain(`rules.0.${ErrorCodes.INVALID_PLAYLIST_RULE_VALUE_ERROR}`);
    });
  });

  describe('success', () => {
    it('should create a smart playlist', async () => {
      const { error, data } = await createSmartPlaylist(
        `smart-playlist-${Date.now()}`,
        SmartPlaylistConjugalEnum.or,
        validRules,
      );
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.playlistId).toBeGreaterThan(0);
      const { error: deleteError } = await deletePlaylist(data?.playlistId || 0);
      expect(deleteError).toBeUndefined();
    });

    it('should create a smart playlist without rules', async () => {
      const { error, data } = await createSmartPlaylist(
        `smart-playlist-${Date.now()}`,
        SmartPlaylistConjugalEnum.and,
        [],
      );
      expect(error).toBeUndefined();
      expect(data?.playlistId).toBeGreaterThan(0);
      await deletePlaylist(data?.playlistId || 0);
    });
  });
});
