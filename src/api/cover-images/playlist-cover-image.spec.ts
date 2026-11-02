import {
  type AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  guestApi,
  testApi,
  unauthenticatedApi,
} from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { PlaylistTypeEnum, SmartPlaylistConjugalEnum } from '../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/playlist-cover-image', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;
  let jwtToken: string;
  let tracks: { id: number; albumId: number }[];

  beforeAll(async () => {
    const newUsername = `cover-images-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create a test account');
    }
    accountId = newAccount.data.account.accountId;
    const session = await guestApi.createSession(newUsername, USER_PASSWORD);
    if (!session.data?.jwtToken) {
      throw new Error('Failed to authenticate the test account');
    }
    jwtToken = session.data.jwtToken;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const { data } = await userApi.GET('/api/list-tracks', {
      params: { query: { offset: 0, limit: 1000 } },
    });
    if (!data?.tracks.length) {
      throw new Error('No test tracks were returned');
    }
    tracks = data.tracks.map(({ id, albumId }) => ({ id, albumId }));
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function createPlaylist(type: PlaylistTypeEnum) {
    const response =
      type === PlaylistTypeEnum.normal
        ? await userApi.POST('/api/create-playlist', { body: { name: `cover-${Date.now()}` } })
        : await userApi.POST('/api/create-smart-playlist', {
            body: {
              name: `smart-cover-${Date.now()}`,
              rulesConjugal: SmartPlaylistConjugalEnum.and,
              rules: [],
            },
          });
    if (!response.data?.playlistId) {
      throw new Error('Failed to create a test playlist');
    }
    return response.data.playlistId;
  }

  async function fetchImage(path: string, id: number) {
    const queryParams = new URLSearchParams({ id: String(id), size: '600' });
    return fetch(`http://localhost:${process.env.SERVER_PORT}${path}?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  }

  async function getCoverEtag(playlistId: number) {
    const response = await fetchImage('/api/playlist-cover-image', playlistId);
    expect(response.ok).toBe(true);
    expect(response.headers.get('content-type')).toMatch(/^image\//);
    return response.headers.get('etag');
  }

  it('rejects unauthenticated and invalid requests', async () => {
    const { error: unauthorizedError } = await unauthenticatedApi.GET('/api/playlist-cover-image', {
      params: { query: { id: 1, size: 600 } },
    });
    expect(unauthorizedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);

    const { error: invalidIdError } = await userApi.GET('/api/playlist-cover-image', {
      params: { query: { id: -1, size: 600 } },
    });
    expect(invalidIdError?.message).toContain(ErrorCodes.INVALID_PLAYLIST_ID_ERROR);
  });

  it('uses the blank cover for smart and empty normal playlists', async () => {
    const normalPlaylistId = await createPlaylist(PlaylistTypeEnum.normal);
    const smartPlaylistId = await createPlaylist(PlaylistTypeEnum.smart);

    expect(await getCoverEtag(normalPlaylistId)).toBe(await getCoverEtag(smartPlaylistId));
  });

  it('uses the first available track cover in playlist order', async () => {
    const playlistId = await createPlaylist(PlaylistTypeEnum.normal);
    const { error } = await userApi.POST('/api/add-playlist-items', {
      params: { query: { id: playlistId } },
      body: { items: tracks.map(({ id }) => ({ trackId: id })) },
    });
    expect(error).toBeUndefined();

    const albumEtags = await Promise.all(
      tracks.map(async ({ albumId }) => {
        const response = await fetchImage('/api/album-cover-image', albumId);
        expect(response.ok).toBe(true);
        return response.headers.get('etag');
      }),
    );
    const expectedEtag = albumEtags.find((etag) => etag !== 'album-0-cover-0-0') ?? albumEtags[0];
    expect(await getCoverEtag(playlistId)).toBe(expectedEtag);
  });
});
