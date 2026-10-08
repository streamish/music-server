import { AssociationTypeEnum, paths } from '../../../types/api-schema';
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

describe('/api/user/set-genre-name', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let genreId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const { data: genreData } = await userApi.GET('/api/user/list-track-associations', {
      params: {
        ...emptyAuthToken.params,
        query: {
          associationType: AssociationTypeEnum.genre,
          offset: 0,
          limit: 1,
        },
      },
    });
    if (!genreData?.associations?.[0]?.id) {
      throw new Error('Failed to fetch genre data');
    }
    genreId = genreData.associations[0].id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  async function listTracks() {
    return userApi.GET('/api/user/list-tracks', {
      params: {
        ...emptyAuthToken.params,
        query: {
          offset: 0,
          limit: 100_000,
        },
      },
    });
  }

  async function setGenreName(
    id: number,
    body: paths['/api/user/set-genre-name']['patch']['requestBody']['content']['application/json'],
  ) {
    return userApi.PATCH('/api/user/set-genre-name', {
      body,
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
      const { error } = await unauthenticatedApi.PATCH(`/api/user/set-genre-name`, {
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
    it('should reject invalid genre id', async () => {
      const { error } = await setGenreName(-1, {
        name: 'Custom Genre',
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_ID_ERROR);
    }, 120_000);

    it('should reject invalid name length', async () => {
      const { error } = await setGenreName(genreId, {
        name: 'a'.repeat(1001),
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_NAME_LENGTH_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create custom name for the genre', async () => {
      const { data: trackDataBefore } = await listTracks();
      const tracksBeforeCustom = trackDataBefore?.tracks.filter((t) => t.genres?.[0]?.id === genreId);
      if (!tracksBeforeCustom) {
        throw new Error('Track not found before custom data set');
      }
      for (let i = 0, len = tracksBeforeCustom.length; i < len; i += 1) {
        const track = tracksBeforeCustom[i];
        if (track) {
          expect(track.genres.map((genre) => genre.name).join(', ')).not.toBe('Custom Genre');
        }
      }
      const { error, data } = await setGenreName(genreId, {
        name: 'Custom Genre',
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
          expect(track.genres.find((genre) => genre.name === 'Custom Genre')).toBeDefined();
        }
      }
    }, 120_000);
  });
});
