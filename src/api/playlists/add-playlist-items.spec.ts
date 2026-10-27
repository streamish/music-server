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

describe('/api/add-playlist-items', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let playlistId: number;
  let smartPlaylistId: number;
  let trackId: number;

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
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function addItems(
    id: number,
    items: { trackId?: number; radioStationTitle?: string; radioStationUrl?: string }[],
    offset?: number,
  ) {
    return userApi.POST(`/api/add-playlist-items`, {
      params: {
        query: {
          id,
        },
      },
      body: {
        items,
        offset,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/add-playlist-items`, {
        params: {
          query: {
            id: 1,
          },
        },
        body: {
          items: [{ trackId: 1 }],
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid playlist id', async () => {
      const { error } = await addItems(-1, [{ trackId }]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject empty items', async () => {
      const { error } = await addItems(playlistId, []);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ITEMS_ERROR);
    });

    it('should reject invalid track id', async () => {
      const { error } = await addItems(playlistId, [{ trackId: -1 }]);
      expect(error?.message).toContain(`items.0.${ErrorCodes.INVALID_TRACK_ID_ERROR}`);
    });

    it('should reject items without a track or station', async () => {
      const { error } = await addItems(playlistId, [{}]);
      expect(error?.message).toContain(`items.0.${ErrorCodes.INVALID_SHOUTCAST_STATION_URL_ERROR}`);
    });

    it('should reject invalid offset', async () => {
      const { error } = await addItems(playlistId, [{ trackId }], -1);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ITEM_OFFSET_ERROR);
    });

    it('should reject missing playlist', async () => {
      const { error } = await addItems(999_999_999, [{ trackId }]);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });

    it('should reject smart playlists', async () => {
      const { error } = await addItems(smartPlaylistId, [{ trackId }]);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR);
    });
  });

  describe('success', () => {
    it('should add a track', async () => {
      const { error, data } = await addItems(playlistId, [{ trackId }]);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.playlistItemIds).toHaveLength(1);
    });

    it('should add a radio station and a track at an offset', async () => {
      const { error, data } = await addItems(
        playlistId,
        [{ radioStationTitle: 'Station', radioStationUrl: 'https://example.com/stream' }, { trackId }],
        0,
      );
      expect(error).toBeUndefined();
      expect(data?.playlistItemIds).toHaveLength(2);
    });
  });
});
