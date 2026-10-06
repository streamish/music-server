import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-album-rating', () => {
  let userApi: UserApi;
  let accountId: number;

  async function setRating(albumId: number, rating: number) {
    const { error, data } = await userApi.setAlbumRating(
      {
        id: albumId,
      },
      {
        rating,
      },
    );
    expect(error).toBeUndefined();
    expect(data?.success).toBe(true);
  }

  async function getAlbum(index: number) {
    const { data } = await userApi.listAlbumsWithTracks({
      offset: 0,
      limit: 100_000,
    });
    const album = data?.albums[index];
    if (!album) {
      throw new Error('No album found');
    }
    return album;
  }

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
    it('should set rating for the tracks', async () => {
      // rate the album
      const albumBefore = await getAlbum(0);
      for (let i = 0; i < albumBefore.tracks.length; i += 1) {
        expect(albumBefore.tracks[i]?.rating).toBe(0);
      }
      await setRating(albumBefore.id, 5);
      // confirm track ratings
      const albumAfter = await getAlbum(0);
      for (let i = 0; i < albumAfter.tracks.length; i += 1) {
        expect(albumAfter.tracks[i]?.rating).toBe(5);
      }
    }, 120_000);

    it('should affect the aggregate rating of the album', async () => {
      // rate the album
      const albumBefore = await getAlbum(1);
      for (let i = 0; i < albumBefore.tracks.length; i += 1) {
        expect(albumBefore.tracks[i]?.rating).toBe(0);
      }
      expect(albumBefore.rating).toBe(0);
      await setRating(albumBefore.id, 3);
      // confirm it affected the album rating
      const albumAfter = await getAlbum(1);
      expect(albumAfter.rating).toBe(3);
    }, 120_000);

    it('should reset rating for the album', async () => {
      // rate the album
      const albumBefore = await getAlbum(2);
      expect(albumBefore.rating).toBe(0);
      await setRating(albumBefore.id, 5);
      // confirm the rating
      const albumRated = await getAlbum(2);
      expect(albumRated.rating).toBe(5);
      // reset the rating
      await setRating(albumBefore.id, 0);
      // confirm the rating has been reset
      const albumAfter = await getAlbum(2);
      for (let i = 0; i < albumAfter.tracks.length; i += 1) {
        expect(albumAfter.tracks[i]?.rating).toBe(0);
      }
    }, 120_000);

    it('should reset the aggregate rating of the album', async () => {
      // rate the album
      const albumBefore = await getAlbum(3);
      expect(albumBefore.rating).toBe(0);
      await setRating(albumBefore.id, 5);
      // confirm the rating
      const albumRated = await getAlbum(3);
      expect(albumRated.rating).toBe(5);
      // reset the rating
      await setRating(albumBefore.id, 0);
      // confirm the aggregate rating is reset
      const albumAfter = await getAlbum(3);
      expect(albumAfter.rating).toBe(0);
    }, 120_000);
  });
});
