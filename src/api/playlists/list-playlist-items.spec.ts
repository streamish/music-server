import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { SmartPlaylistConjugalEnum, SmartPlaylistFieldEnum, SmartPlaylistOperationEnum } from '../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/list-playlist-items', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let otherUserApi: AuthenticatedApiClient;
  let otherAccountId: number;
  let normalPlaylistId: number;
  let trackIds: number[];
  let allTracks: { id: number; year: number }[];

  async function listItems(api: AuthenticatedApiClient, id: number, offset?: number, limit?: number) {
    return api.GET(`/api/list-playlist-items`, {
      params: {
        query: {
          id,
          offset,
          limit,
        },
      },
    });
  }

  async function createSmartPlaylist(
    rulesConjugal: SmartPlaylistConjugalEnum,
    rules: { field: SmartPlaylistFieldEnum; operation: SmartPlaylistOperationEnum; value: string }[],
  ) {
    const { data } = await userApi.POST(`/api/create-smart-playlist`, {
      body: { name: `smart-${Date.now()}-${Math.random()}`, rulesConjugal, rules },
    });
    if (!data?.playlistId) {
      throw new Error('Failed to create smart playlist');
    }
    return data.playlistId;
  }

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const otherUsername = `other-user-${Date.now()}`;
    const otherAccount = await testApi.duplicateAccount(USER_USERNAME, otherUsername);
    if (!otherAccount.data?.account.accountId) {
      throw new Error('Failed to create other account');
    }
    otherAccountId = otherAccount.data.account.accountId;
    otherUserApi = await createAuthenticatedApi(otherUsername, USER_PASSWORD);
    const { data: tracks } = await userApi.GET('/api/list-tracks', { params: { query: { offset: 0, limit: 1000 } } });
    if (!tracks?.tracks || tracks.tracks.length < 2) {
      throw new Error('Not enough tracks');
    }
    allTracks = tracks.tracks;
    trackIds = allTracks.slice(0, 2).map((t) => t.id);
    const { data } = await userApi.POST(`/api/create-playlist`, { body: { name: 'normal' } });
    if (!data?.playlistId) {
      throw new Error('Failed to create playlist');
    }
    normalPlaylistId = data.playlistId;
    const { error } = await userApi.POST(`/api/add-playlist-items`, {
      params: { query: { id: normalPlaylistId } },
      body: {
        items: [
          { trackId: trackIds[1] },
          { radioStationTitle: 'Station', radioStationUrl: 'https://example.com/stream' },
          { trackId: trackIds[0] },
        ],
      },
    });
    if (error) {
      throw new Error('Failed to add items');
    }
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
    await testApi.deleteAccount(otherAccountId);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/list-playlist-items`, {
        params: { query: { id: normalPlaylistId } },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should not list another user playlist', async () => {
      const { error } = await listItems(otherUserApi, normalPlaylistId);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid id', async () => {
      const { error } = await listItems(userApi, -1);
      expect(error?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await listItems(userApi, normalPlaylistId, 0, 0);
      expect(error?.message).toContain(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await listItems(userApi, normalPlaylistId, -1, 10);
      expect(error?.message).toContain(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject a missing playlist', async () => {
      const { error } = await listItems(userApi, 999_999_999);
      expect(error?.message).toContain(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    it('should list normal playlist tracks and radio stations in order', async () => {
      const { error, data } = await listItems(userApi, normalPlaylistId);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.total).toBe(3);
      const items = data?.playlistItems;
      expect(items?.map((i) => i.position)).toEqual([1, 2, 3]);
      expect(items?.[0]?.id).toBeGreaterThan(0);
      expect(items?.[0]?.track?.id).toBe(trackIds[1]);
      expect(items?.[1]?.track).toBeUndefined();
      expect(items?.[1]?.radioStationTitle).toBe('Station');
      expect(items?.[1]?.radioStationUrl).toBe('https://example.com/stream');
      expect(items?.[2]?.track?.id).toBe(trackIds[0]);
    });

    it('should paginate normal playlist items', async () => {
      const { error, data } = await listItems(userApi, normalPlaylistId, 1, 1);
      expect(error).toBeUndefined();
      expect(data?.total).toBe(3);
      expect(data?.limit).toBe(1);
      expect(data?.offset).toBe(1);
      expect(data?.playlistItems).toHaveLength(1);
      expect(data?.playlistItems[0]?.radioStationTitle).toBe('Station');
    });

    it('should list every track for a smart playlist without rules', async () => {
      const playlistId = await createSmartPlaylist(SmartPlaylistConjugalEnum.and, []);
      const { error, data } = await listItems(userApi, playlistId);
      expect(error).toBeUndefined();
      expect(data?.total).toBe(allTracks.length);
      expect(data?.playlistItems[0]?.id).toBeUndefined();
      expect(data?.playlistItems[0]?.position).toBe(1);
      expect(data?.playlistItems).toHaveLength(allTracks.length);
    });

    it('should filter smart playlist tracks by rules', async () => {
      const year = allTracks[0]?.year as number;
      const playlistId = await createSmartPlaylist(SmartPlaylistConjugalEnum.and, [
        {
          field: SmartPlaylistFieldEnum.year,
          operation: SmartPlaylistOperationEnum.is,
          value: String(year),
        },
      ]);
      const expected = allTracks.filter((t) => t.year === year).map((t) => t.id);
      const { error, data } = await listItems(userApi, playlistId);
      expect(error).toBeUndefined();
      expect(data?.total).toBe(expected.length);
      expect(data?.playlistItems.map((i) => i.track?.id)).toEqual(expected);
    });

    it('should combine smart playlist rules with and / or', async () => {
      const year = allTracks[0]?.year as number;
      const rules = [
        { field: SmartPlaylistFieldEnum.year, operation: SmartPlaylistOperationEnum.is, value: String(year) },
        { field: SmartPlaylistFieldEnum.year, operation: SmartPlaylistOperationEnum.is_not, value: String(year) },
      ];
      const andId = await createSmartPlaylist(SmartPlaylistConjugalEnum.and, rules);
      const orId = await createSmartPlaylist(SmartPlaylistConjugalEnum.or, rules);
      const { data: andData } = await listItems(userApi, andId);
      const { data: orData } = await listItems(userApi, orId);
      expect(andData?.total).toBe(0);
      expect(orData?.total).toBe(allTracks.length);
    });

    it('should paginate smart playlist tracks', async () => {
      const playlistId = await createSmartPlaylist(SmartPlaylistConjugalEnum.and, []);
      const { data: all } = await listItems(userApi, playlistId);
      const { error, data } = await listItems(userApi, playlistId, 1, 1);
      expect(error).toBeUndefined();
      expect(data?.total).toBe(allTracks.length);
      expect(data?.playlistItems).toHaveLength(1);
      expect(data?.playlistItems[0]?.position).toBe(2);
      expect(data?.playlistItems[0]?.track?.id).toBe(all?.playlistItems[1]?.track?.id);
    });
  });
});
