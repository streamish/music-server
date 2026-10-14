import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/update-shoutcast-genre', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `update-stations-user-${Date.now()}`;
    const account = await testApi.createAccount(username);
    accountId = account.id || 0;
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

  async function updateGenre(id: number, name: string) {
    return api.PATCH('/api/update-shoutcast-genre', {
      params: {
        query: {
          id,
        },
      },
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
      const { error } = await unauthenticatedApi.PATCH(`/api/update-shoutcast-genre`, {
        params: {
          query: {
            id: 123,
          },
        },
        body: {
          name: 'Guest update',
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should return an error for an empty name', async () => {
      const name = `Test Genre ${Date.now()}`;
      const { data } = await createGenre(name);
      const id = data?.genre?.id;
      if (!id) {
        throw new Error(`Failed to create test genre`);
      }
      const { error } = await updateGenre(id, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR);
    });

    it('should return an error for a very long name', async () => {
      const name = `Test Genre ${Date.now()}`;
      const { data } = await createGenre(name);
      const id = data?.genre?.id;
      if (!id) {
        throw new Error(`Failed to create test genre`);
      }
      const { error } = await updateGenre(id, 'Genre With Long Name'.repeat(10));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_GENRE_NAME_LENGTH_ERROR);
    });

    it('should reject duplicate genre name', async () => {
      const name = `Duplicate Genre ${Date.now()}`;
      const updateName = `Genre to update ${Date.now()}`;
      await createGenre(name);
      const { data } = await createGenre(updateName);
      const id = data?.genre?.id;
      if (!id) {
        throw new Error(`Failed to create test genre`);
      }
      const { error } = await updateGenre(id, updateName);
      expect(error?.message[0]).toBe(ErrorCodes.SHOUTCAST_GENRE_ALREADY_EXISTS_ERROR);
    });
  });

  describe('success', () => {
    it('should update genre', async () => {
      // create the genre
      const name = `Test Updating Genre ${Date.now()}`;
      const { data } = await createGenre(name);
      const id = data?.genre?.id;
      if (!id) {
        throw new Error(`Failed to create test genre`);
      }
      // update the genre
      const updatedName = `${name} - Updated`;
      await updateGenre(id, updatedName);
      // verify update
      const { data: updatedList } = await listGenres();
      expect(updatedList?.genres.some((item) => item.name === updatedName)).toBe(true);
    });
  });
});
