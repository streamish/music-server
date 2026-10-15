import { AssociationTypeEnum } from '../../types/api-schema';
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

describe('/api/set-association-favorite', () => {
  let accountId: number;
  let userApi: AuthenticatedApiClient;
  let associationId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.account.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.account.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const { data } = await userApi.GET('/api/list-track-associations', {
      params: {
        query: {
          associationType: AssociationTypeEnum.artist,
          offset: 0,
          limit: 1,
        },
      },
    });
    const association = data?.associations?.[0];
    if (!association) {
      throw new Error('Association not found');
    }
    associationId = association.id;
  });

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  });

  async function listFavorites() {
    return userApi.GET('/api/list-favorites', {
      params: {
        query: {
          offset: 0,
          limit: 100_000,
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
      const { error } = await unauthenticatedApi.PUT(`/api/set-association-favorite`, {
        params: {
          query: {
            id: associationId,
            associationType: AssociationTypeEnum.artist,
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid association id', async () => {
      const { error } = await setAssociationFavorite(-1, AssociationTypeEnum.artist);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR);
    });
  });

  describe('success', () => {
    it('should create favorite for the association', async () => {
      // create the favorite
      const { error, data } = await setAssociationFavorite(associationId, AssociationTypeEnum.artist);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { data: listFavoritesData } = await listFavorites();
      const favoriteItem = listFavoritesData?.favorites.find((item) => item.id === data?.favoriteId);
      if (!favoriteItem) {
        throw new Error('Favorite item not found');
      }
      expect(favoriteItem.association?.id).toBe(associationId);
      // verify the item is favorited
      const { data: associations2 } = await userApi.GET('/api/list-track-associations', {
        params: {
          query: {
            associationType: AssociationTypeEnum.artist,
            offset: 0,
            limit: 1,
          },
        },
      });
      const associationNow = associations2?.associations[0];
      expect(associationNow?.favoriteId).toBe(favoriteItem.id);
    });
  });
});
