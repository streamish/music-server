import {
  AuthenticatedApiClient,
  USER_PASSWORD,
  USER_USERNAME,
  createAuthenticatedApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/regenerate-master-session-key', () => {
  let adminApi: AuthenticatedApiClient;

  beforeAll(async () => {
    adminApi = await createAuthenticatedApi();
  });

  async function regenerateMasterSessionKey() {
    return adminApi.POST('/api/admin/regenerate-master-session-key', {});
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.POST(`/api/admin/regenerate-master-session-key`, {});
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const nonAuthenticatedApiClient = await createAuthenticatedApi(USER_USERNAME, USER_PASSWORD);
      const { error } = await nonAuthenticatedApiClient.POST('/api/admin/regenerate-master-session-key', {});
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    // note: enabling this test will break the other tests that require a valid session key, so it is skipped for now
    it.skip('should generate new master session key', async () => {
      const { error, data } = await regenerateMasterSessionKey();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      const { error: error2 } = await adminApi.GET('/api/admin/list-accounts', {});
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });
});
