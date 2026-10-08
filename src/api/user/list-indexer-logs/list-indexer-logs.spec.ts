import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  AuthenticatedApiClient,
  createAuthenticatedApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/user/list-indexer-logs', () => {
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    userApi = await createAuthenticatedApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  async function listIndexerLogs() {
    return userApi.GET('/api/user/list-indexer-logs', {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/user/list-indexer-logs`, {});
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
