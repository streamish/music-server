import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  emptyAuthToken,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/delete-custom-data', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  async function deleteCustomData(id: number) {
    return userApi.DELETE(`/api/user/delete-custom-data`, {
      params: {
        ...emptyAuthToken.params,
        query: {
          id,
        },
      },
    });
  }

  async function listTracks(params: { offset: number; limit: number }) {
    return userApi.GET(`/api/user/list-tracks`, {
      params: {
        ...emptyAuthToken.params,
        query: {
          offset: params.offset,
          limit: params.limit,
        },
      },
    });
  }

  async function setCustomData(
    id: number,
    params: {
      albumArtists: string;
      albumTitle: string;
      title: string;
      artists: string;
      comment: string;
      composers: string;
      discNumber: number;
      genres: string;
      trackNumber: number;
      year: number;
    },
  ) {
    return userApi.PUT(`/api/user/set-custom-data`, {
      body: {
        albumArtists: params.albumArtists,
        albumTitle: params.albumTitle,
        title: params.title,
        artists: params.artists,
        comment: params.comment,
        composers: params.composers,
        discNumber: params.discNumber,
        genres: params.genres,
        trackNumber: params.trackNumber,
        year: params.year,
      },
      params: {
        ...emptyAuthToken.params,
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/user/delete-custom-data`, {
        params: {
          query: {
            id: 1,
          },
          ...emptyAuthToken.params,
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid file id', async () => {
      const { error } = await userApi.DELETE(`/api/user/delete-custom-data`, {
        params: {
          ...emptyAuthToken.params,
          query: {
            id: -1,
          },
        },
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TRACK_ID_ERROR);
    });
  });

  describe('success', () => {
    it('should delete custom data for the file', async () => {
      // get the track information before deleting
      const { data: trackDataBeforeDelete } = await listTracks({
        offset: 0,
        limit: 1,
      });
      const trackBeforeDelete = trackDataBeforeDelete?.tracks[0];
      if (!trackBeforeDelete) {
        throw new Error('Track not found before delete');
      }
      const trackId = trackBeforeDelete.id;
      const { error, data } = await setCustomData(trackId, {
        albumArtists: 'Custom albumArtists',
        albumTitle: 'Custom albumTitle',
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 9,
        genres: 'Custom genres',
        trackNumber: 7,
        year: 1950,
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // confirm the track uses custom data
      const { data: trackData } = await listTracks({
        offset: 0,
        limit: 100_000,
      });
      const track = trackData?.tracks.find((t) => t.id === trackId);
      if (!track) {
        throw new Error('Track not found');
      }
      expect(track.albumArtists.map((artist) => artist.name).join(', ')).toBe('Custom albumArtists');
      expect(track.albumTitle).toBe('Custom albumTitle');
      expect(track.title).toBe('Custom title');
      expect(track.artists.map((artist) => artist.name).join(', ')).toBe('Custom artists');
      expect(track.comment).toBe('Custom comment');
      expect(track.composers.map((composer) => composer.name).join(', ')).toBe('Custom composers');
      expect(track.discNumber).toBe(9);
      expect(track.genres.map((genre) => genre.name).join(', ')).toBe('Custom genres');
      expect(track.trackNumber).toBe(7);
      expect(track.year).toBe(1950);
      // delete the data
      const { error: deleteError, data: deleteData } = await deleteCustomData(trackId);
      expect(deleteError).toBeUndefined();
      expect(deleteData?.success).toBe(true);
      // confirm the track no longer uses custom data
      const { data: trackDataAfterDelete } = await listTracks({
        offset: 0,
        limit: 100_000,
      });
      const trackAfterDelete = trackDataAfterDelete?.tracks.find((t) => t.id === trackId);
      if (!trackAfterDelete) {
        throw new Error('Track not found after delete');
      }
      expect(trackAfterDelete.albumArtists.map((artist) => artist.name).join(', ')).toBe(
        trackBeforeDelete.albumArtists.map((artist) => artist.name).join(', '),
      );
      expect(trackAfterDelete.albumTitle).toBe(trackBeforeDelete.albumTitle);
      expect(trackAfterDelete.title).toBe(trackBeforeDelete.title);
      expect(trackAfterDelete.artists.map((artist) => artist.name).join(', ')).toBe(
        trackBeforeDelete.artists.map((artist) => artist.name).join(', '),
      );
      expect(trackAfterDelete.comment).toBe(trackBeforeDelete.comment);
      expect(trackAfterDelete.composers.map((composer) => composer.name).join(', ')).toBe(
        trackBeforeDelete.composers.map((composer) => composer.name).join(', '),
      );
      expect(trackAfterDelete.discNumber).toBe(trackBeforeDelete.discNumber);
      expect(trackAfterDelete.genres.map((genre) => genre.name).join(', ')).toBe(
        trackBeforeDelete.genres.map((genre) => genre.name).join(', '),
      );
      expect(trackAfterDelete.trackNumber).toBe(trackBeforeDelete.trackNumber);
      expect(trackAfterDelete.year).toBe(trackBeforeDelete.year);
    });
  });
});
