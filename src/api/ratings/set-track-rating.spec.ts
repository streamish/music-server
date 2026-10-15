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

describe('/api/set-track-rating', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

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

  async function listTracks() {
    return userApi.GET('/api/list-tracks', {
      params: {
        query: {
          offset: 0,
          limit: 100_000,
        },
      },
    });
  }

  async function retrieveAlbum(id: number) {
    return userApi.GET('/api/retrieve-album', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function setTrackRating(trackId: number, rating: number) {
    return userApi.PUT('/api/set-track-rating', {
      params: {
        query: {
          id: trackId,
        },
      },
      body: {
        rating,
      },
    });
  }

  async function getAlbum(albumId: number) {
    const { data } = await retrieveAlbum(albumId);
    const album = data?.album;
    if (!album) {
      throw new Error('Album not found');
    }
    return album;
  }

  async function getTrack(index: number) {
    const { data } = await listTracks();
    const track = data?.tracks[index];
    if (!track) {
      throw new Error('Track not found');
    }
    return track;
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/set-track-rating`, {
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
    it('should reject invalid track id', async () => {
      const { error } = await setTrackRating(-1, 5);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TRACK_ID_ERROR);
    });

    it('should reject nonexistent track id', async () => {
      const { error } = await setTrackRating(999999, 5);
      expect(error?.message[0]).toBe(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should set rating for the track', async () => {
      // rate track
      const trackBefore = await getTrack(0);
      expect(trackBefore.rating).toBeFalsy();
      await setTrackRating(trackBefore.id, 5);
      // confirm it rated
      const trackAfter = await getTrack(0);
      if (!trackAfter) {
        throw new Error('Track not found');
      }
      expect(trackAfter.rating).toBe(5);
    });

    it('should affect rating for the album', async () => {
      // rate track
      const trackBefore = await getTrack(1);
      expect(trackBefore.rating).toBeFalsy();
      await setTrackRating(trackBefore.id, 5);
      // confirm it rated
      const trackAfter = await getTrack(1);
      expect(trackAfter.rating).toBe(5);
      // confirm it affected album
      const album = await getAlbum(trackBefore.albumId);
      const ratingTotal = album.tracks.reduce((total, track) => total + (track.rating || 0), 0);
      const averageRating = ratingTotal / album.tracks.length;
      expect(album.rating).toBe(averageRating);
    });

    it('should reset rating for the track', async () => {
      // rate track
      const trackBefore = await getTrack(2);
      expect(trackBefore.rating).toBeFalsy();
      await setTrackRating(trackBefore.id, 4);
      // confirm it rated
      const trackAfter = await getTrack(2);
      expect(trackAfter.rating).toBe(4);
      // reset the rating
      await setTrackRating(trackBefore.id, 0);
      // confirm it reset
      const trackAfterReset = await getTrack(2);
      expect(trackAfterReset.rating).toBe(0);
    });

    it('should reset rating for the album', async () => {
      const trackBefore = await getTrack(3);
      expect(trackBefore.rating).toBeFalsy();
      await setTrackRating(trackBefore.id, 5);
      // confirm it rated
      const trackAfter = await getTrack(3);
      expect(trackAfter.rating).toBe(5);
      // reset rating
      await setTrackRating(trackAfter.id, 0);
      // confirm it affected album
      const album = await getAlbum(trackAfter.albumId);
      expect(album.rating).toBe(0);
    });
  });
});
