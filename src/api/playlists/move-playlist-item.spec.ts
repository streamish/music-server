import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { SmartPlaylistConjugalEnum } from '../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/move-playlist-item', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let playlistId: number;
  let smartPlaylistId: number;
  let itemIds: number[];

  async function movePlaylistItem(id: number, playlistItemId: number, offset: number) {
    return userApi.PATCH(`/api/move-playlist-item`, {
      params: {
        query: {
          id,
        },
      },
      body: {
        playlistItemId,
        offset,
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
    const { data } = await userApi.POST(`/api/create-playlist`, { body: { name: 'normal' } });
    const { data: smartData } = await userApi.POST(`/api/create-smart-playlist`, {
      body: {
        name: 'smart',
        rulesConjugal: SmartPlaylistConjugalEnum.and,
        rules: [],
      },
    });
    if (!data?.playlistId || !smartData?.playlistId) {
      throw new Error('Failed to create playlists');
    }
    playlistId = data.playlistId;
    smartPlaylistId = smartData.playlistId;
    const { data: addData } = await userApi.POST(`/api/add-playlist-items`, {
      params: {
        query: {
          id: playlistId,
        },
      },
      body: {
        items: [{ trackId: track.id }, { trackId: track.id }, { trackId: track.id }],
      },
    });
    itemIds = addData?.playlistItemIds || [];
    if (itemIds.length !== 3) {
      throw new Error('Failed to add playlist items');
    }
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/move-playlist-item`, {
        params: {
          query: {
            id: 1,
          },
        },
        body: {
          playlistItemId: 1,
          offset: 0,
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid playlist id', async () => {
      const { error } = await movePlaylistItem(-1, 1, 0);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject invalid playlist item id', async () => {
      const { error } = await movePlaylistItem(playlistId, -1, 0);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ITEM_ID_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await movePlaylistItem(playlistId, itemIds[0] || 1, -1);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ITEM_OFFSET_ERROR);
    });

    it('should reject missing playlist', async () => {
      const { error } = await movePlaylistItem(999_999_999, itemIds[0] || 1, 0);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });

    it('should reject items not in the playlist', async () => {
      const { error } = await movePlaylistItem(playlistId, 999_999_999, 0);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR);
    });

    it('should reject smart playlists', async () => {
      const { error } = await movePlaylistItem(smartPlaylistId, itemIds[0] || 1, 0);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR);
    });
  });

  describe('success', () => {
    it('should move an item to the start', async () => {
      const { error, data } = await movePlaylistItem(playlistId, itemIds[2] || 0, 0);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });

    it('should move an item to the end when the offset is beyond the end', async () => {
      const { error, data } = await movePlaylistItem(playlistId, itemIds[2] || 0, 100);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });
  });
});
