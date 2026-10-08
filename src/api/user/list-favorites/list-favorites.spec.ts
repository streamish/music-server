import { AssociationTypeEnum, paths } from '../../../types/api-schema';
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

describe('/api/user/list-favorites', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  async function listAlbums(query: paths['/api/user/list-albums']['get']['parameters']['query']) {
    return userApi.GET('/api/user/list-albums', {
      params: {
        query,
      },
    });
  }

  async function listTracks(query: paths['/api/user/list-tracks']['get']['parameters']['query']) {
    return userApi.GET('/api/user/list-tracks', {
      params: {
        query,
      },
    });
  }

  async function folderStructure() {
    return userApi.GET('/api/user/folder-structure', {});
  }

  async function listAlbumAssociations(
    query: paths['/api/user/list-album-associations']['get']['parameters']['query'],
  ) {
    return userApi.GET('/api/user/list-album-associations', {
      params: {
        query,
      },
    });
  }

  async function listFavorites(query: paths['/api/user/list-favorites']['get']['parameters']['query']) {
    return userApi.GET('/api/user/list-favorites', {
      params: {
        query,
      },
    });
  }

  async function setAlbumFavorite(id: number) {
    return userApi.PUT('/api/user/set-album-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function setTrackFavorite(id: number) {
    return userApi.PUT('/api/user/set-track-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function setFolderFavorite(folderPath: string) {
    return userApi.PUT('/api/user/set-folder-favorite', {
      params: {
        query: {
          folder: folderPath,
        },
      },
    });
  }

  async function setAssociationFavorite(id: number, associationType: AssociationTypeEnum) {
    return userApi.PUT('/api/user/set-association-favorite', {
      params: {
        query: {
          id,
          associationType,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/user/list-favorites`, {});
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should list favorites', async () => {
      // get test album
      const { data: albumData } = await listAlbums({
        offset: 0,
        limit: 1,
      });
      const album = albumData?.albums[0];
      if (!album) {
        throw new Error('Album not found');
      }
      // get test track
      const { data: trackData } = await listTracks({
        offset: 0,
        limit: 1,
      });
      const track = trackData?.tracks[0];
      if (!track) {
        throw new Error('Track not found');
      }
      // get test folder
      const { data: folderData } = await folderStructure();
      const folderItem = folderData?.items?.[0]?.children?.[0]?.fullPath;
      if (!folderItem) {
        throw new Error('Folder not found');
      }
      // get test association
      const { data: associationData } = await listAlbumAssociations({
        associationType: AssociationTypeEnum.composer,
      });
      const association = associationData?.associations[0];
      if (!association) {
        throw new Error('Association not found');
      }
      // create favorites for the test album, track, and folder
      await setAlbumFavorite(album.id);
      await setTrackFavorite(track.id);
      await setFolderFavorite(folderItem);
      await setAssociationFavorite(association.id, AssociationTypeEnum.composer);
      const { error, data } = await listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(error).toBeUndefined();
      expect(data?.favorites.some((f) => f.album?.id === album.id)).toBe(true);
      expect(data?.favorites.some((f) => f.track?.id === track.id)).toBe(true);
      expect(data?.favorites.some((f) => f.folder?.fullPath === folderItem)).toBe(true);
      expect(data?.favorites.some((f) => f.association?.id === association.id)).toBe(true);
    }, 120_000);
  });
});
