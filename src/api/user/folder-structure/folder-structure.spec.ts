import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/folder-structure', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/folder-structure`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    it('should return nested folder list', async () => {
      const { data } = await userApi.folderStructure();
      const artist1 = data?.items?.[0];
      const artist2 = data?.items?.[1];
      expect(data?.items.length).toBe(3);
      expect(artist1?.children?.length).toBe(2);
      expect(artist1?.children?.[0]?.folder).toBe('Album 1');
      expect(artist1?.children?.[0]?.children?.length).toBe(5);
      expect(artist1?.children?.[0]?.children?.[0]?.file?.length).toBeGreaterThan(0);
      expect(artist1?.children?.[1]?.folder).toBe('Album 2');
      expect(artist1?.children?.[1]?.children?.length).toBe(2);
      expect(artist1?.children?.[1]?.children?.[0]?.folder).toBe('CD 1');
      expect(artist1?.children?.[1]?.children?.[0]?.children?.length).toBe(4);
      expect(artist1?.children?.[1]?.children?.[1]?.folder).toBe('CD 2');
      expect(artist1?.children?.[1]?.children?.[1]?.children?.length).toBe(3);
      expect(artist2?.children?.length).toBe(1);
      expect(artist2?.children?.[0]?.folder).toBe('Album 3');
      expect(artist2?.children?.[0]?.children?.length).toBe(5);
      expect(artist2?.children?.[0]?.children?.[0]?.file?.length).toBeGreaterThan(0);
      expect(artist2?.children?.[0]?.children?.[1]?.file?.length).toBeGreaterThan(0);
    });

    it('should return file list', async () => {
      const { data } = await userApi.folderStructure();
      const artist1 = data?.items?.[0];
      const artist2 = data?.items?.[1];
      expect(artist1?.children?.[0]?.folder).toBe('Album 1');
      expect(artist1?.children?.[0]?.children?.length).toBe(5);
      for (let i = 0; i < (artist1?.children?.[0]?.children?.length ?? 0); i += 1) {
        expect(artist1?.children?.[0]?.children?.[i]?.file?.length).toBeGreaterThan(0);
      }
      expect(artist1?.children?.[1]?.folder).toBe('Album 2');
      expect(artist1?.children?.[1]?.children?.length).toBe(2);
      expect(artist1?.children?.[1]?.children?.[0]?.folder).toBe('CD 1');
      expect(artist1?.children?.[1]?.children?.[0]?.children?.length).toBe(4);
      for (let i = 0; i < (artist1?.children?.[1]?.children?.[0]?.children?.length ?? 0); i += 1) {
        expect(artist1?.children?.[1]?.children?.[0]?.children?.[i]?.file?.length).toBeGreaterThan(0);
      }
      expect(artist1?.children?.[1]?.children?.[1]?.folder).toBe('CD 2');
      expect(artist1?.children?.[1]?.children?.[1]?.children?.length).toBe(3);
      for (let i = 0; i < (artist1?.children?.[1]?.children?.[1]?.children?.length ?? 0); i += 1) {
        expect(artist1?.children?.[1]?.children?.[1]?.children?.[i]?.file?.length).toBeGreaterThan(0);
      }
      expect(artist2?.children?.length).toBe(1);
      expect(artist2?.children?.[0]?.folder).toBe('Album 3');
      expect(artist2?.children?.[0]?.children?.length).toBe(5);
      for (let i = 0; i < (artist2?.children?.[0]?.children?.length ?? 0); i += 1) {
        expect(artist2?.children?.[0]?.children?.[i]?.file?.length).toBeGreaterThan(0);
      }
    });
  });
});
