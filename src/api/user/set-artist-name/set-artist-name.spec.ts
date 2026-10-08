import { AssociationTypeEnum } from '../../../types/api-schema';
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

describe('/api/user/set-artist-name', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let artistId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const { data: artistData } = await userApi.GET('/api/user/list-album-associations', {
      params: {
        query: {
          associationType: AssociationTypeEnum.artist,
          offset: 0,
          limit: 1,
        },
      },
    });
    if (!artistData?.associations?.[0]?.id) {
      throw new Error('Failed to fetch artist data');
    }
    artistId = artistData.associations[0].id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  async function listTracks() {
    return userApi.GET('/api/user/list-tracks', {
      params: {
        query: {
          associationType: AssociationTypeEnum.artist,
          offset: 0,
          limit: 100_000,
        },
      },
    });
  }

  async function setArtistName(id: number, body: { name: string }) {
    return userApi.PATCH('/api/user/set-artist-name', {
      body,
      params: {
        query: {
          id,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/user/set-artist-name`, {
        body: {
          name: 'Custom Artist',
          title: 'Custom title',
          year: 2026,
        },
        params: {
          query: {
            id: 1,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('errors', () => {
    it('should reject invalid artist id', async () => {
      const { error } = await setArtistName(-1, {
        name: 'Custom Artist',
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ARTIST_ID_ERROR);
    }, 120_000);

    it('should reject invalid name length', async () => {
      const { error } = await setArtistName(artistId, {
        name: 'a'.repeat(1001),
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_NAME_LENGTH_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create custom name for the artist', async () => {
      const { data: trackDataBefore } = await listTracks();
      const tracksBeforeCustom = trackDataBefore?.tracks.filter((t) => t.artists?.[0]?.id === artistId);
      if (!tracksBeforeCustom) {
        throw new Error('Track not found before custom data set');
      }
      for (let i = 0, len = tracksBeforeCustom.length; i < len; i += 1) {
        const track = tracksBeforeCustom[i];
        if (track) {
          expect(track.artists.map((artist) => artist.name).join(', ')).not.toBe('Custom Artist');
        }
      }
      const { error, data } = await setArtistName(artistId, {
        name: 'Custom Artist',
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the track
      const { data: trackDataAfter } = await listTracks();
      const tracks = trackDataAfter?.tracks.filter((t) => tracksBeforeCustom.some((tb) => tb.id === t.id));
      if (!tracks?.length) {
        throw new Error('Track not found');
      }
      for (let i = 0, len = tracks.length; i < len; i += 1) {
        const track = tracks[i];
        if (track) {
          expect(track.artists.map((artist) => artist.name).join(', ')).toBe('Custom Artist');
        }
      }
    }, 120_000);
  });
});
