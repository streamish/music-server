import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/set-album-rating', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  async function setAlbumRating(albumId: number, rating: number) {
    return userApi.PUT('/api/set-album-rating', {
      body: {
        rating,
      },
      params: {
        query: {
          id: albumId,
        },
      },
    });
  }

  async function getAlbum(index: number) {
    const { data } = await userApi.GET('/api/list-albums-with-tracks', {
      params: {
        query: {
          offset: 0,
          limit: index + 1,
        },
      },
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
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-album-rating`, {
        body: {
          rating: 3,
        },
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid album id', async () => {
      const { error } = await setAlbumRating(-1, 4);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ALBUM_ID_ERROR);
    });

    it('should reject nonexistent album id', async () => {
      const { error } = await setAlbumRating(999999, 4);
      expect(error?.message[0]).toBe(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should set rating for the tracks', async () => {
      // rate the album
      const albumBefore = await getAlbum(0);
      for (let i = 0; i < albumBefore.tracks.length; i += 1) {
        expect(albumBefore.tracks[i]?.rating).toBe(0);
      }
      await setAlbumRating(albumBefore.id, 4);
      // confirm track ratings
      const albumAfter = await getAlbum(0);
      for (let i = 0; i < albumAfter.tracks.length; i += 1) {
        expect(albumAfter.tracks[i]?.rating).toBe(4);
      }
    });

    it('should affect the aggregate rating of the album', async () => {
      // rate the album
      const albumBefore = await getAlbum(1);
      for (let i = 0; i < albumBefore.tracks.length; i += 1) {
        expect(albumBefore.tracks[i]?.rating).toBe(0);
      }
      expect(albumBefore.rating).toBe(0);
      await setAlbumRating(albumBefore.id, 3);
      // confirm it affected the album rating
      const albumAfter = await getAlbum(1);
      expect(albumAfter.rating).toBe(3);
    });

    it('should reset rating for the album', async () => {
      // rate the album
      const albumBefore = await getAlbum(2);
      expect(albumBefore.rating).toBe(0);
      await setAlbumRating(albumBefore.id, 4);
      // confirm the rating
      const albumRated = await getAlbum(2);
      expect(albumRated.rating).toBe(4);
      // reset the rating
      await setAlbumRating(albumBefore.id, 0);
      // confirm the rating has been reset
      const albumAfter = await getAlbum(2);
      for (let i = 0; i < albumAfter.tracks.length; i += 1) {
        expect(albumAfter.tracks[i]?.rating).toBe(0);
      }
    });

    it('should reset the aggregate rating of the album', async () => {
      // rate the album
      const albumBefore = await getAlbum(3);
      expect(albumBefore.rating).toBe(0);
      await setAlbumRating(albumBefore.id, 4);
      // confirm the rating
      const albumRated = await getAlbum(3);
      expect(albumRated.rating).toBe(4);
      // reset the rating
      await setAlbumRating(albumBefore.id, 0);
      // confirm the aggregate rating is reset
      const albumAfter = await getAlbum(3);
      expect(albumAfter.rating).toBe(0);
    });
  });
});
