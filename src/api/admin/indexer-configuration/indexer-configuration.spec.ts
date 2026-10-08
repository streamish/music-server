import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  emptyAuthToken,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/indexer-configuration', () => {
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  async function getIndexerConfiguration() {
    return adminApi.GET('/api/admin/indexer-configuration', {
      ...emptyAuthToken,
    });
  }

  async function setIndexerStatus(enabled: boolean) {
    return adminApi.PATCH('/api/admin/set-indexer-status', {
      body: {
        enabled,
      },
      ...emptyAuthToken,
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/admin/indexer-configuration`, {
        ...emptyAuthToken,
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.GET('/api/admin/indexer-configuration', {
        ...emptyAuthToken,
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should get the indexer configuration', async () => {
      const { error, data } = await getIndexerConfiguration();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });

    it('should get the latest indexer configuration', async () => {
      const { error, data } = await getIndexerConfiguration();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      await setIndexerStatus(false);
      const { data: data2 } = await getIndexerConfiguration();
      expect(data2?.success).toBe(true);
      expect(data2?.configuration.id).toBeGreaterThan(data?.configuration.id ?? 0);
      await setIndexerStatus(true);
    });
  });
});
