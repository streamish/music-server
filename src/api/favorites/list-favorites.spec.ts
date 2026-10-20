import { AssociationTypeEnum, paths } from '../../types/api-schema';
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
import { sep } from 'node:path';

describe('/api/list-favorites', () => {
  let userApi: AuthenticatedApiClient;
  let accountId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function listAlbums(query: paths['/api/list-albums']['get']['parameters']['query']) {
    return userApi.GET('/api/list-albums', {
      params: {
        query,
      },
    });
  }

  async function listTracks(query: paths['/api/list-tracks']['get']['parameters']['query']) {
    return userApi.GET('/api/list-tracks', {
      params: {
        query,
      },
    });
  }

  async function listFolderContents(path: string) {
    return userApi.GET('/api/list-folder-contents', {
      params: {
        query: {
          path,
        },
      },
    });
  }

  async function listAlbumAssociations(query: paths['/api/list-album-associations']['get']['parameters']['query']) {
    return userApi.GET('/api/list-album-associations', {
      params: {
        query,
      },
    });
  }

  async function listFavorites(query: paths['/api/list-favorites']['get']['parameters']['query']) {
    return userApi.GET('/api/list-favorites', {
      params: {
        query,
      },
    });
  }

  async function setAlbumFavorite(id: number) {
    return userApi.PUT('/api/set-album-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function setTrackFavorite(id: number) {
    return userApi.PUT('/api/set-track-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function setFolderFavorite(id: number) {
    return userApi.PUT('/api/set-folder-favorite', {
      params: {
        query: {
          id,
        },
      },
    });
  }

  async function setAssociationFavorite(id: number, associationType: AssociationTypeEnum) {
    return userApi.PUT('/api/set-association-favorite', {
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
      const { error } = await unauthenticatedApi.GET(`/api/list-favorites`, {});
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
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
      const { data: folderData } = await listFolderContents(sep);
      const folderItem = folderData?.folder;
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
      await setFolderFavorite(folderItem.id);
      await setAssociationFavorite(association.id, AssociationTypeEnum.composer);
      const { error, data } = await listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(error).toBeUndefined();
      expect(data?.favorites.some((f) => f.album?.id === album.id)).toBe(true);
      expect(data?.favorites.some((f) => f.track?.id === track.id)).toBe(true);
      expect(data?.favorites.some((f) => f.folder?.id === folderItem.id)).toBe(true);
      expect(data?.favorites.some((f) => f.association?.id === association.id)).toBe(true);
    });
  });
});
