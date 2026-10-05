import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-track-rating', () => {
  let userApi: UserApi;
  let accountId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PUT(`/api/user/set-track-rating`, {
        body: {
          rating: 3,
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
    it('should reject invalid track id', async () => {
      const { error } = await userApi.setTrackRating(
        {
          id: -1,
        },
        {
          rating: 5,
        },
      );
      expect(error?.message[0]).toBe(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should set rating for the track', async () => {
      const { data: trackDataBefore } = await userApi.listTracks({
        offset: 0,
        limit: 1,
      });
      const trackBefore = trackDataBefore?.tracks[0];
      if (!trackBefore) {
        throw new Error('Track not found before custom data set');
      }
      expect(trackBefore.rating).toBeFalsy();
      const { error, data } = await userApi.setTrackRating(
        {
          id: trackBefore.id,
        },
        {
          rating: 5,
        },
      );
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the track
      const { data: trackDataAfter } = await userApi.listTracks({
        offset: 0,
        limit: 1,
      });
      const trackAfter = trackDataAfter?.tracks[0];
      if (!trackAfter) {
        throw new Error('Track not found');
      }
      expect(trackAfter.rating).toBe(5);
    }, 120_000);
  });
});
