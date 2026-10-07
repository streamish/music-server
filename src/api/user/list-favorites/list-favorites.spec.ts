import { AssociationTypeEnum } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/list-favorites', () => {
  let accountId: number;
  let userApi: UserApi;
  let albumId: number;
  let associationId: number;
  let folder: string;
  let trackId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
    // get test album
    const { data } = await userApi.listAlbums({
      offset: 0,
      limit: 1,
    });
    const album = data?.albums[0];
    if (!album) {
      throw new Error('Album not found');
    }
    albumId = album.id;
    // get test track
    const { data: trackData } = await userApi.listTracks({
      offset: 0,
      limit: 1,
    });
    const track = trackData?.tracks[0];
    if (!track) {
      throw new Error('Track not found');
    }
    trackId = track.id;
    // get test folder
    const { data: folderData } = await userApi.folderStructure();
    const folderItem = folderData?.items?.[0]?.children?.[0]?.fullPath;
    if (!folderItem) {
      throw new Error('Folder not found');
    }
    folder = folderItem;
    // get test association
    const { data: associationData } = await userApi.listAlbumAssociations({
      associationType: AssociationTypeEnum.composer,
    });
    const association = associationData?.associations[0];
    if (!association) {
      throw new Error('Association not found');
    }
    associationId = association.id;
    // create favorites for the test album, track, and folder
    await userApi.setAlbumFavorite({ id: albumId });
    await userApi.setTrackFavorite({ id: trackId });
    await userApi.setFolderFavorite({ folder });
    await userApi.setAssociationFavorite({ id: associationId, associationType: AssociationTypeEnum.composer });
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-favorites`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should list favorites', async () => {
      const { error, data } = await userApi.listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(error).toBeUndefined();
      expect(data?.favorites.some((f) => f.album?.id === albumId)).toBe(true);
      expect(data?.favorites.some((f) => f.track?.id === trackId)).toBe(true);
      expect(data?.favorites.some((f) => f.folder?.fullPath === folder)).toBe(true);
      expect(data?.favorites.some((f) => f.association?.id === associationId)).toBe(true);
    }, 120_000);
  });
});
