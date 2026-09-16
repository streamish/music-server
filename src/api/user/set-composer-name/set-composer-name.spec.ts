import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-composer-name', () => {
  let userApi: UserApi;
  let accountId: number;
  let composerId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
    const { data: composerData } = await userApi.listTrackComposers({
      offset: 0,
      limit: 1,
    });
    if (!composerData?.composers?.[0]?.id) {
      throw new Error('Failed to fetch composer data');
    }
    composerId = composerData.composers[0].id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PATCH(`/api/user/set-composer-name`, {
        body: {
          name: 'Custom Composer',
          title: 'Custom title',
          year: 2026,
        },
        params: {
          query: {
            id: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('errors', () => {
    it('should reject invalid composer id', async () => {
      const { error } = await userApi.setComposerName(-1, {
        name: 'Custom Composer',
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSER_ID_ERROR);
    }, 120_000);

    it('should reject invalid name length', async () => {
      const { error } = await userApi.setComposerName(composerId, {
        name: 'a'.repeat(1001),
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_NAME_LENGTH_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create custom data for the file', async () => {
      const { data: trackDataBefore } = await userApi.listTracks({
        offset: 0,
        limit: 100_000,
      });
      const tracksBeforeCustom = trackDataBefore?.tracks.filter((t) => t.composers?.[0]?.id === composerId);
      if (!tracksBeforeCustom) {
        throw new Error('Track not found before custom data set');
      }
      for (let i = 0, len = tracksBeforeCustom.length; i < len; i += 1) {
        const track = tracksBeforeCustom[i];
        if (track) {
          expect(track.composers.map((composer) => composer.name).join(', ')).not.toBe('Custom Composer');
        }
      }
      const { error, data } = await userApi.setComposerName(composerId, {
        name: 'Custom Composer',
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the track
      const { data: trackDataAfter } = await userApi.listTracks({
        offset: 0,
        limit: 99_999,
      });
      const tracks = trackDataAfter?.tracks.filter((t) => tracksBeforeCustom.some((tb) => tb.id === t.id));
      if (!tracks?.length) {
        throw new Error('Track not found');
      }
      for (let i = 0, len = tracks.length; i < len; i += 1) {
        const track = tracks[i];
        if (track) {
          expect(track.composers.find((composer) => composer.name === 'Custom Composer')).toBeDefined();
        }
      }
    }, 120_000);
  });
});
