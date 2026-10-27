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

describe('/api/remove-playlist-items', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let playlistId: number;
  let trackId: number;

  async function addItems(id: number, trackIds: number[]) {
    return userApi.POST(`/api/add-playlist-items`, {
      params: {
        query: {
          id,
        },
      },
      body: {
        items: trackIds.map((item) => ({ trackId: item })),
      },
    });
  }

  async function removeItems(id: number, playlistItemIds: number[]) {
    return userApi.DELETE(`/api/remove-playlist-items`, {
      params: {
        query: {
          id,
        },
      },
      body: {
        playlistItemIds,
      },
    });
  }

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const { data: tracks } = await userApi.GET('/api/list-tracks', {
      params: {
        query: {
          offset: 0,
          limit: 1,
        },
      },
    });
    const track = tracks?.tracks[0];
    if (!track) {
      throw new Error('Track not found');
    }
    trackId = track.id;
    const { data } = await userApi.POST(`/api/create-playlist`, { body: { name: 'normal' } });
    if (!data?.playlistId) {
      throw new Error('Failed to create playlist');
    }
    playlistId = data.playlistId;
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.DELETE(`/api/remove-playlist-items`, {
        params: {
          query: {
            id: 1,
          },
        },
        body: {
          playlistItemIds: [1],
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid playlist id', async () => {
      const { error } = await removeItems(-1, [1]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject empty item ids', async () => {
      const { error } = await removeItems(playlistId, []);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR);
    });

    it('should reject invalid item ids', async () => {
      const { error } = await removeItems(playlistId, [-1]);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR);
    });

    it('should reject missing playlist', async () => {
      const { error } = await removeItems(999_999_999, [1]);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });

    it('should reject items not in the playlist', async () => {
      const { error } = await removeItems(playlistId, [999_999_999]);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should remove items from the playlist', async () => {
      const { data: addData } = await addItems(playlistId, [trackId, trackId]);
      const itemIds = addData?.playlistItemIds || [];
      expect(itemIds).toHaveLength(2);
      const { error, data } = await removeItems(playlistId, [itemIds[0] || 0]);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // the removed item is gone but the other remains
      const { error: removedError } = await removeItems(playlistId, [itemIds[0] || 0]);
      expect(removedError?.message).toContain(ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR);
      const { error: remainingError } = await removeItems(playlistId, [itemIds[1] || 0]);
      expect(remainingError).toBeUndefined();
    });
  });
});
