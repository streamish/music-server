import { AssociationTypeEnum } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { USER_PASSWORD, USER_USERNAME, UserApi, api, createUserApi, testApi } from '../../../test-helper';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-association-favorite', () => {
  let accountId: number;
  let userApi: UserApi;
  let associationId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createUserApi(newUsername, USER_PASSWORD);
    const { data } = await userApi.listAlbumAssociations({
      associationType: AssociationTypeEnum.artist,
      offset: 0,
      limit: 1,
    });
    const association = data?.associations?.[0];
    if (!association) {
      throw new Error('Association not found');
    }
    associationId = association.id;
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PUT(`/api/user/set-association-favorite`, {
        params: {
          query: {
            id: associationId,
            associationType: AssociationTypeEnum.artist,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    }, 120_000);
  });

  describe('errors', () => {
    it('should reject invalid association id', async () => {
      const { error } = await userApi.setAssociationFavorite({ id: -1, associationType: AssociationTypeEnum.artist });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create favorite for the association', async () => {
      // create the favorite
      const { error, data } = await userApi.setAssociationFavorite({
        id: associationId,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await userApi.listFavorites({
        offset: 0,
        limit: 99_999,
      });
      expect(listFavoritesError).toBeUndefined();
      expect(listFavoritesData?.favorites.some((f) => f.association?.id === associationId)).toBe(true);
    }, 120_000);
  });
});
