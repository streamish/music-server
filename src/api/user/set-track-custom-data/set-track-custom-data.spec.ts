import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-track-custom-data', () => {
  let userApi: UserApi;
  let accountId: number;
  let trackId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
    const { data: trackData } = await userApi.listTracks({
      offset: 0,
      limit: 1,
    });
    if (!trackData?.tracks[0]?.id) {
      throw new Error('Failed to fetch track data');
    }
    const track = trackData.tracks[0];
    trackId = track.id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PATCH(`/api/user/set-track-custom-data`, {
        body: {
          title: 'Custom title',
          artists: 'Custom artists',
          comment: 'Custom comment',
          composers: 'Custom composers',
          discNumber: 1111,
          duration: 2222,
          genres: 'Custom genres',
          trackNumber: 3333,
          year: 4444,
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
    it('should reject invalid file id', async () => {
      const { error } = await userApi.setTrackCustomData(-1, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILE_ID_ERROR);
    }, 120_000);

    it('should reject invalid artists length', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'a'.repeat(1001),
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid comment length', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'a'.repeat(1001),
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMMENT_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid composers length', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'a'.repeat(1001),
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_COMPOSERS_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid disc number', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1.2345,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_DISC_NUMBER_ERROR);
    }, 120_000);

    it('should reject invalid disc number range', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 20000,
        genres: 'Custom genres',
        trackNumber: 1,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_DISC_NUMBER_RANGE_ERROR);
    }, 120_000);

    it('should reject invalid genres length', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'a'.repeat(1001),
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRES_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid title length', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'a'.repeat(256),
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TITLE_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid track number range', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 2131230,
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TRACK_NUMBER_RANGE_ERROR);
    }, 120_000);

    it('should reject invalid year range', async () => {
      const { error } = await userApi.setTrackCustomData(trackId, {
        title: 'Custom title',
        artists: 'Custom artists',
        comment: 'Custom comment',
        composers: 'Custom composers',
        discNumber: 1,
        genres: 'Custom genres',
        trackNumber: 3,
        year: 32230,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_YEAR_RANGE_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create custom data for the file', async () => {
      const { data: trackDataBefore } = await userApi.listTracks({
        offset: 0,
        limit: 100_000,
      });
      const trackBeforeCustom = trackDataBefore?.tracks.find((t) => t.id === trackId);
      if (!trackBeforeCustom) {
        throw new Error('Track not found before custom data set');
      }
      expect(trackBeforeCustom.title).not.toBe('Custom title');
      expect(trackBeforeCustom.artists.map((artist) => artist.name).join(', ')).not.toBe('Custom artists');
      expect(trackBeforeCustom.comment).not.toBe('Custom comment');
      expect(trackBeforeCustom.composers.map((composer) => composer.name).join(', ')).not.toBe('Custom composers');
      expect(trackBeforeCustom.discNumber).not.toBe(9);
      expect(trackBeforeCustom.genres.map((genre) => genre.name).join(', ')).not.toBe('Custom genres');
      expect(trackBeforeCustom.trackNumber).not.toBe(7);
      expect(trackBeforeCustom.year).not.toBe(1950);
      const { error, data } = await userApi.setTrackCustomData(trackId, {
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
      // find the track
      const { data: trackData } = await userApi.listTracks({
        offset: 0,
        limit: 100_000,
      });
      const track = trackData?.tracks.find((t) => t.id === trackId);
      if (!track) {
        throw new Error('Track not found');
      }
      expect(track.title).toBe('Custom title');
      expect(track.artists.map((artist) => artist.name).join(', ')).toBe('Custom artists');
      expect(track.comment).toBe('Custom comment');
      expect(track.composers.map((composer) => composer.name).join(', ')).toBe('Custom composers');
      expect(track.discNumber).toBe(9);
      expect(track.genres.map((genre) => genre.name).join(', ')).toBe('Custom genres');
      expect(track.trackNumber).toBe(7);
      expect(track.year).toBe(1950);
    }, 120_000);
  });
});
