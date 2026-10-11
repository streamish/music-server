import { AuthenticatedApiClient, createAuthenticatedApi, unauthenticatedApi } from '../../test-helper';
import { ErrorCodes } from '../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/list-indexer-logs', () => {
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  async function listIndexerLogs() {
    return adminApi.GET('/api/list-indexer-logs', {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/list-indexer-logs`, {});
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should list indexer logs', async () => {
      const { error, data } = await listIndexerLogs();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.logs.length).toBeGreaterThan(0);
    });
  });
});
