import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-album-custom-data', () => {
  let accountId: number;
  let userApi: UserApi;
  let albumId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
    const { data: albumData } = await userApi.listAlbums({
      offset: 0,
      limit: 1,
    });
    if (!albumData?.albums?.[0]) {
      throw new Error('Album not found');
    }
    const album = albumData.albums[0];
    albumId = album.id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PATCH(`/api/user/set-album-custom-data`, {
        body: {
          artists: 'Custom albumArtists',
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
    it('should reject invalid album id', async () => {
      const { error } = await userApi.setAlbumCustomData(-1, {
        artists: 'Custom albumArtists',
        title: 'Custom title',
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ALBUM_ID_ERROR);
    }, 120_000);

    it('should reject invalid artists length', async () => {
      const { error } = await userApi.setAlbumCustomData(albumId, {
        artists: 'a'.repeat(1001),
        title: 'Custom title',
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTISTS_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid title length', async () => {
      const { error } = await userApi.setAlbumCustomData(albumId, {
        artists: 'Custom albumArtists',
        title: 'a'.repeat(1001),
        year: 2026,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_TITLE_LENGTH_ERROR);
    }, 120_000);

    it('should reject invalid year range', async () => {
      const { error } = await userApi.setAlbumCustomData(albumId, {
        artists: 'Custom albumArtists',
        title: 'Custom albumTitle',
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
      const tracksBeforeCustom = trackDataBefore?.tracks.filter((t) => t.albumId === albumId);
      if (!tracksBeforeCustom) {
        throw new Error('Track not found before custom data set');
      }
      for (let i = 0, len = tracksBeforeCustom.length; i < len; i += 1) {
        const track = tracksBeforeCustom[i];
        if (track) {
          expect(track.albumArtists.map((artist) => artist.name).join(', ')).not.toBe('Custom albumArtists');
          expect(track.albumTitle).not.toBe('Custom albumTitle');
          expect(track.year).not.toBe(1950);
        }
      }
      const { error, data } = await userApi.setAlbumCustomData(albumId, {
        artists: 'Custom albumArtists',
        title: 'Custom albumTitle',
        year: 1950,
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the track
      const { data: trackDataAfter } = await userApi.listTracks({
        offset: 0,
        limit: 99_999,
      });
      const tracks = trackDataAfter?.tracks.filter((t) => t.albumId === albumId);
      if (!tracks?.length) {
        throw new Error('Track not found');
      }
      for (let i = 0, len = tracks.length; i < len; i += 1) {
        const track = tracks[i];
        if (track) {
          expect(track.albumArtists.map((artist) => artist.name).join(', ')).toBe('Custom albumArtists');
          expect(track.albumTitle).toBe('Custom albumTitle');
          expect(track.year).toBe(1950);
        }
      }
    }, 120_000);
  });
});
