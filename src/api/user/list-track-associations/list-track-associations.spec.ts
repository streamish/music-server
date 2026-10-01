import { ADMIN_PASSWORD, ADMIN_USERNAME, UserApi, api, createUserApi } from '../../../test-helper';
import { AssociationSortFieldEnum, AssociationTypeEnum, SortDirectionEnum } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-track-associations', () => {
  let userApi: UserApi;

  beforeAll(async () => {
    userApi = await createUserApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/user/list-track-associations`, {
        params: {
          header: {
            Authorization: '',
          },
          query: {
            associationType: AssociationTypeEnum.artist,
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid addedAfter date', async () => {
      const { error } = await userApi.listTrackAssociations({
        addedAfter: 'invalid-date',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await userApi.listTrackAssociations({
        addedBefore: 'invalid-date',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await userApi.listTrackAssociations({
        filter: '',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILTER_LENGTH_ERROR);
    });

    // it('should reject invalid genre', async () => {
    //   const { error } = await userApi.listAlbumArtists({ genre: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    // });

    it('should reject invalid genre length', async () => {
      const { error } = await userApi.listTrackAssociations({
        genre: ['x'.repeat(300)],
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await userApi.listTrackAssociations({
        offset: 0,
        limit: -1000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await userApi.listTrackAssociations({
        offset: 0,
        limit: 1_000_000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await userApi.listTrackAssociations({
        offset: 0,
        limit: 'asdf' as unknown as number,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await userApi.listTrackAssociations({
        offset: -1000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await userApi.listTrackAssociations({
        offset: 'asdf' as unknown as number,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await userApi.listTrackAssociations({
        sortDirection: 'invalid-direction' as SortDirectionEnum,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await userApi.listTrackAssociations({
        sortField: 'invalid-field' as unknown as AssociationSortFieldEnum,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await userApi.listTrackAssociations({
          genre: ['Rock'],
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(2);
        expect(associations.length).toBe(2);
        expect(associations[0]?.name).toBe('Artist 1');
        expect(associations[1]?.name).toBe('Artist 3, Artist 2');
      });

      it('should filter by search term', async () => {
        const { data } = await userApi.listTrackAssociations({
          filter: '3',
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(3);
        expect(associations.length).toBe(3);
        expect(associations[0]?.name).toBe('Artist 3');
        expect(associations[1]?.name).toBe('Artist 3 ft. Artist 2');
        expect(associations[2]?.name).toBe('Artist 3, Artist 2');
      });
    });

    describe('sort', () => {
      it('should sort by artist ASC', async () => {
        const { data } = await userApi.listTrackAssociations({
          sortField: AssociationSortFieldEnum.name,
          sortDirection: SortDirectionEnum.asc,
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(5);
        expect(associations.length).toBe(5);
        expect(associations[0]?.name).toBe('Artist 1');
        expect(associations[1]?.name).toBe('Artist 2');
        expect(associations[2]?.name).toBe('Artist 3');
        expect(associations[3]?.name).toBe('Artist 3 ft. Artist 2');
        expect(associations[4]?.name).toBe('Artist 3, Artist 2');
      });

      it('should sort by artist DESC', async () => {
        const { data } = await userApi.listTrackAssociations({
          sortField: AssociationSortFieldEnum.name,
          sortDirection: SortDirectionEnum.desc,
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(5);
        expect(associations.length).toBe(5);
        expect(associations[0]?.name).toBe('Artist 3, Artist 2');
        expect(associations[1]?.name).toBe('Artist 3 ft. Artist 2');
        expect(associations[2]?.name).toBe('Artist 3');
        expect(associations[3]?.name).toBe('Artist 2');
        expect(associations[4]?.name).toBe('Artist 1');
      });
    });
  });

  describe('success', () => {
    it('should return all artists', async () => {
      const { data } = await userApi.listTrackAssociations({ associationType: AssociationTypeEnum.artist });
      const { associations, total } = data || { associations: [], total: 0 };
      expect(total).toBe(5);
      expect(associations.length).toBe(5);
    });

    it('should paginate results', async () => {
      const { data } = await userApi.listTrackAssociations({
        offset: 0,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { associations, total } = data || { associations: [], total: 0 };
      expect(total).toBe(5);
      expect(associations.length).toBe(2);
      expect(associations[0]?.name).toBe('Artist 1');
      expect(associations[1]?.name).toBe('Artist 2');
      const { data: data2 } = await userApi.listTrackAssociations({
        offset: 1,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { associations: associations2, total: total2 } = data2 || { associations: [], total: 0 };
      expect(total2).toBe(5);
      expect(associations2.length).toBe(2);
      expect(associations2[0]?.name).toBe('Artist 2');
      expect(associations2[1]?.name).toBe('Artist 3');
      const { data: data3 } = await userApi.listTrackAssociations({
        offset: 2,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { associations: associations3, total: total3 } = data3 || { associations: [], total: 0 };
      expect(total3).toBe(5);
      expect(associations3.length).toBe(2);
      expect(associations3[0]?.name).toBe('Artist 3');
      expect(associations3[0]?.name).toBe('Artist 3');
      expect(associations3[1]?.name).toBe('Artist 3 ft. Artist 2');
    });
  });
});
