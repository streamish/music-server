import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/shoutcast/delete-genre', () => {
  let api: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const username = `delete-genre-${Date.now()}`;
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

  async function deleteGenre(id: number) {
    return api.DELETE('/api/delete-shoutcast-genre', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function listGenres() {
    return api.GET('/api/list-shoutcast-genres');
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/delete-shoutcast-genre`, {
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
    it('should reject invalid genre id', async () => {
      const { error } = await deleteGenre(0);
      expect(error?.message?.[0]).toBe(ErrorCodes.INVALID_SHOUTCAST_GENRE_ID_ERROR);
    });

    it('should reject nonexistent genre id', async () => {
      const { error } = await deleteGenre(99999);
      expect(error?.message?.[0]).toBe(ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should delete an existing genre', async () => {
      const { data } = await listGenres();
      const genreId = data?.genres?.[0]?.id;
      if (!genreId) {
        throw new Error(`No genres available to delete`);
      }
      // delete the genre
      await deleteGenre(genreId);
      // verify delete
      const { data: updatedData } = await listGenres();
      expect(updatedData?.genres.some((item) => item.id === genreId)).toBe(false);
    });
  });
});
