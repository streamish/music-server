import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-album-rating', () => {
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
      const { error } = await api.PUT(`/api/user/set-album-rating`, {
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
    it('should reject invalid album id', async () => {
      const { error } = await userApi.setAlbumRating(
        {
          id: -1,
        },
        {
          rating: 5,
        },
      );
      expect(error?.message[0]).toBe(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should set rating for the album', async () => {
      const { data: albumDataBefore } = await userApi.listAlbums({
        offset: 1,
        limit: 1,
      });
      const albumBefore = albumDataBefore?.albums[0];
      if (!albumBefore) {
        throw new Error('Album not found before custom data set');
      }
      expect(albumBefore.rating).toBeFalsy();
      const { error, data } = await userApi.setAlbumRating(
        {
          id: albumBefore.id,
        },
        {
          rating: 5,
        },
      );
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the album
      const { data: albumDataAfter } = await userApi.listAlbumsWithTracks({
        offset: 1,
        limit: 1,
      });
      const albumAfter = albumDataAfter?.albums[0];
      if (!albumAfter) {
        throw new Error('Album not found');
      }
      for (let i = 0; i < albumAfter.tracks.length; i += 1) {
        expect(albumAfter.tracks[i]?.rating).toBe(5);
      }
    }, 120_000);

    it('should affect the rating of the album', async () => {
      const { data: albumDataBefore } = await userApi.listAlbums({
        offset: 2,
        limit: 1,
      });
      const albumBefore = albumDataBefore?.albums[0];
      if (!albumBefore) {
        throw new Error('Album not found before custom data set');
      }
      expect(albumBefore.rating).toBeFalsy();
      const { error, data } = await userApi.setAlbumRating(
        {
          id: albumBefore.id,
        },
        {
          rating: 3,
        },
      );
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the album
      const { data: albumDataAfter } = await userApi.listAlbumsWithTracks({
        offset: 2,
        limit: 1,
      });
      const albumAfter = albumDataAfter?.albums[0];
      if (!albumAfter) {
        throw new Error('Album not found');
      }
      expect(albumAfter.rating).toBe(3);
    }, 120_000);
  });
});
