import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/set-indexer-status', () => {
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  async function getIndexerConfiguration() {
    return adminApi.GET('/api/admin/indexer-configuration', {});
  }

  async function setIndexerStatus(enabled: boolean) {
    return adminApi.PATCH('/api/admin/set-indexer-status', {
      body: {
        enabled,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.PATCH(`/api/admin/set-indexer-status`, {
        body: {
          enabled: true,
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.PATCH('/api/admin/set-indexer-status', {
        body: {
          enabled: true,
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing enabled value', async () => {
      const { error } = await setIndexerStatus(undefined as unknown as boolean);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.INVALID_ENABLED_ERROR);
    });
  });

  describe('success', () => {
    it('should change status', async () => {
      const before = await getIndexerConfiguration();
      await setIndexerStatus(!before.data?.configuration.isEnabled);
      const after = await getIndexerConfiguration();
      expect(after.data?.configuration.isEnabled).toBe(!before.data?.configuration.isEnabled);
      await setIndexerStatus(true);
    });
  });
});
