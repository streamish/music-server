import { AssociationTypeEnum } from '../../../types/api-schema';
import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  emptyAuthToken,
  testApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/set-association-favorite', () => {
  let accountId: number;
  let userApi: AuthenticatedApiClient;
  let associationId: number;

  beforeAll(async () => {
    const newUsername = `user-${Date.now()}`;
    const newAccount = await testApi.duplicateAccount(USER_USERNAME, newUsername);
    if (!newAccount.data?.accountId) {
      throw new Error('Failed to create new account');
    }
    accountId = newAccount.data.accountId;
    userApi = await createAuthenticatedApi(newUsername, USER_PASSWORD);
    const { data } = await userApi.GET('/api/user/list-track-associations', {
      params: {
        ...emptyAuthToken.params,
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
  }, 120_000);

  afterAll(async () => {
    await testApi.deleteAccount(accountId);
  }, 120_000);

  async function listFavorites() {
    return userApi.GET('/api/user/list-favorites', {
      params: {
        ...emptyAuthToken.params,
        query: {
          offset: 0,
          limit: 100_000,
        },
      },
    });
  }

  async function setAssociationFavorite(id: number, associationType: AssociationTypeEnum) {
    return userApi.PUT('/api/user/set-association-favorite', {
      params: {
        ...emptyAuthToken.params,
        query: {
          id,
          associationType,
        },
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PUT(`/api/user/set-association-favorite`, {
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
      const { error } = await setAssociationFavorite(-1, AssociationTypeEnum.artist);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ASSOCIATION_ID_ERROR);
    }, 120_000);
  });

  describe('success', () => {
    it('should create favorite for the association', async () => {
      // create the favorite
      const { error, data } = await setAssociationFavorite(associationId, AssociationTypeEnum.artist);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // find the favorite
      const { error: listFavoritesError, data: listFavoritesData } = await listFavorites();
      expect(listFavoritesError).toBeUndefined();
      expect(listFavoritesData?.favorites.some((f) => f.association?.id === associationId)).toBe(true);
    }, 120_000);
  });
});
