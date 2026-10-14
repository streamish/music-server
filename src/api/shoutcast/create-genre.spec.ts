import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/create-shoutcast-genre', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `create-genre-user-${Date.now()}`;
    const account = await testApi.createAccount(username);
    accountId = account.id;
    if (!accountId) {
      throw new Error(`Failed to create test account`);
    }
    api = await createAuthenticatedApi(username, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createGenre(name: string) {
    return api.POST('/api/create-shoutcast-genre', {
      body: {
        name,
      },
    });
  }

  async function listGenres() {
    return api.GET('/api/list-shoutcast-genres');
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/create-shoutcast-genre`, {
        body: {
          name: 'asdf',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should return an error for an empty name', async () => {
      const { error } = await createGenre('');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR);
    });

    it('should return an error for a very long name', async () => {
      const { error } = await createGenre('Genre With Long Name'.repeat(10));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR);
    });

    it('should reject duplicate genre name', async () => {
      const name = `Duplicate Genre ${Date.now()}`;
      await createGenre(name);
      const { error } = await createGenre(name);
      expect(error?.message[0]).toBe(ErrorCodes.SHOUTCAST_GENRE_ALREADY_EXISTS_ERROR);
    });
  });

  describe('success', () => {
    it('should add a new user-defined genre', async () => {
      const name = `Test User-Defined Genre ${Date.now()}`;
      await createGenre(name);
      const { data } = await listGenres();
      expect(data?.genres.some((item) => item.name === name)).toBe(true);
    });

    it('should add a new favorite genre', async () => {
      const name = `Test Adding Favorite Genre ${Date.now()}`;
      await createGenre(name);
      const { data } = await listGenres();
      expect(data?.genres.some((item) => item.name === name)).toBe(true);
    });
  });
});
