import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import {
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from '../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/update-smart-playlist-rules', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let smartPlaylistId: number;
  let normalPlaylistId: number;

  const rules = [
    {
      field: SmartPlaylistFieldEnum.genre,
      operation: SmartPlaylistOperationEnum.is,
      value: 'Rock',
    },
    {
      field: SmartPlaylistFieldEnum.date_added,
      operation: SmartPlaylistOperationEnum.in_the_last,
      value: '2',
      interval: SmartPlaylistIntervalTagEnum.weeks,
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
    const { data: smartData } = await userApi.POST(`/api/create-smart-playlist`, {
      body: {
        name: 'smart',
        rulesConjugal: SmartPlaylistConjugalEnum.and,
        rules: rules.slice(0, 1),
      },
    });
    const { data: normalData } = await userApi.POST(`/api/create-playlist`, {
      body: {
        name: 'normal',
      },
    });
    if (!smartData?.playlistId || !normalData?.playlistId) {
      throw new Error('Failed to create playlists');
    }
    smartPlaylistId = smartData.playlistId;
    normalPlaylistId = normalData.playlistId;
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function updateRules(
    id: number,
    rulesConjugal: SmartPlaylistConjugalEnum,
    newRules: Record<string, unknown>[],
  ) {
    return userApi.PATCH(`/api/update-smart-playlist-rules`, {
      params: {
        query: {
          id,
        },
      },
      body: {
        rulesConjugal,
        rules: newRules as typeof rules,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/update-smart-playlist-rules`, {
        params: {
          query: {
            id: 1,
          },
        },
        body: {
          rulesConjugal: SmartPlaylistConjugalEnum.and,
          rules,
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid playlist id', async () => {
      const { error } = await updateRules(-1, SmartPlaylistConjugalEnum.and, rules);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject invalid conjugal', async () => {
      const { error } = await updateRules(smartPlaylistId, 'xor' as SmartPlaylistConjugalEnum, rules);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_RULES_CONJUGAL_ERROR);
    });

    it('should reject invalid rule operation', async () => {
      const { error } = await updateRules(smartPlaylistId, SmartPlaylistConjugalEnum.and, [
        { ...rules[0], operation: 'nope' },
      ]);
      expect(error?.message).toContain(`rules.0.${ErrorCodes.INVALID_PLAYLIST_RULE_OPERATION_ERROR}`);
    });

    it('should reject missing playlist', async () => {
      const { error } = await updateRules(999_999_999, SmartPlaylistConjugalEnum.and, rules);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });

    it('should reject normal playlists', async () => {
      const { error } = await updateRules(normalPlaylistId, SmartPlaylistConjugalEnum.and, rules);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR);
    });
  });

  describe('success', () => {
    it('should replace the rules of a smart playlist', async () => {
      const { error, data } = await updateRules(smartPlaylistId, SmartPlaylistConjugalEnum.or, rules);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });

    it('should clear the rules of a smart playlist', async () => {
      const { error, data } = await updateRules(smartPlaylistId, SmartPlaylistConjugalEnum.and, []);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });
  });
});
