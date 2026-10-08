import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  AuthenticatedApiClient,
  createAuthenticatedApi,
  unauthenticatedApi,
} from '../../../test-helper';
import { AssociationSortFieldEnum, AssociationTypeEnum, SortDirectionEnum, paths } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-album-associations-with-tracks', () => {
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    userApi = await createAuthenticatedApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  async function listAlbumAssociationsWithTracks(
    query: paths['/api/user/list-album-associations-with-tracks']['get']['parameters']['query'],
  ) {
    return userApi.GET('/api/user/list-album-associations-with-tracks', {
      params: {
        query,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/user/list-album-associations-with-tracks`, {
        params: {
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
      const { error } = await listAlbumAssociationsWithTracks({
        addedAfter: 'invalid-date',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        addedBefore: 'invalid-date',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        filter: '',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_FILTER_LENGTH_ERROR);
    });

    // it('should reject invalid genre', async () => {
    //   const { error } = await userApi.listAlbumAssociationsWithTracks({ genre: [0 as unknown as string] });
    //   expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    // });

    it('should reject invalid genre length', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        genre: ['x'.repeat(300)],
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        offset: 0,
        limit: -1000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        offset: 0,
        limit: 1_000_000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        offset: 0,
        limit: 'asdf' as unknown as number,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        offset: -1000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        offset: 'asdf' as unknown as number,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        sortDirection: 'invalid-direction' as SortDirectionEnum,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await listAlbumAssociationsWithTracks({
        sortField: 'invalid-field' as unknown as AssociationSortFieldEnum,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await listAlbumAssociationsWithTracks({
          genre: ['Rock'],
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(2);
        expect(associations.length).toBe(2);
        expect(associations[0]?.name).toBe('Artist 1');
        expect(associations[1]?.name).toBe('Artist 3');
      });

      it('should filter by search term', async () => {
        const { data } = await listAlbumAssociationsWithTracks({
          filter: '3',
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(1);
        expect(associations.length).toBe(1);
        expect(associations[0]?.name).toBe('Artist 3');
      });
    });

    describe('sort', () => {
      it('should sort by artist ASC', async () => {
        const { data } = await listAlbumAssociationsWithTracks({
          sortField: AssociationSortFieldEnum.name,
          sortDirection: SortDirectionEnum.asc,
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(3);
        expect(associations.length).toBe(3);
        expect(associations[0]?.name).toBe('Artist 1');
        expect(associations[1]?.name).toBe('Artist 2');
        expect(associations[2]?.name).toBe('Artist 3');
      });

      it('should sort by artist DESC', async () => {
        const { data } = await listAlbumAssociationsWithTracks({
          sortField: AssociationSortFieldEnum.name,
          sortDirection: SortDirectionEnum.desc,
          associationType: AssociationTypeEnum.artist,
        });
        const { associations, total } = data || { associations: [], total: 0 };
        expect(total).toBe(3);
        expect(associations.length).toBe(3);
        expect(associations[0]?.name).toBe('Artist 3');
        expect(associations[1]?.name).toBe('Artist 2');
        expect(associations[2]?.name).toBe('Artist 1');
      });
    });
  });

  describe('success', () => {
    it('should return all artists', async () => {
      const { data } = await listAlbumAssociationsWithTracks({ associationType: AssociationTypeEnum.artist });
      const { associations, total } = data || { associations: [], total: 0 };
      expect(total).toBe(3);
      expect(associations.length).toBe(3);
      for (let i = 0; i < associations.length; i += 1) {
        const artist = associations[i];
        expect(artist).toBeDefined();
        expect(artist?.albums).toBeDefined();
        expect(artist?.albums.length).toBeGreaterThan(0);
        for (let j = 0; j < (artist?.albums || []).length; j += 1) {
          const album = artist?.albums[j];
          expect(album).toBeDefined();
          expect(album?.tracks).toBeDefined();
          expect(album?.tracks.length).toBeGreaterThan(0);
        }
      }
    });

    it('should paginate results', async () => {
      const { data } = await listAlbumAssociationsWithTracks({
        offset: 0,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { associations, total } = data || { associations: [], total: 0 };
      expect(total).toBe(3);
      expect(associations.length).toBe(2);
      expect(associations[0]?.name).toBe('Artist 1');
      expect(associations[1]?.name).toBe('Artist 2');
      const { data: data2 } = await listAlbumAssociationsWithTracks({
        offset: 1,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { associations: items2, total: total2 } = data2 || { associations: [], total: 0 };
      expect(total2).toBe(3);
      expect(items2.length).toBe(2);
      expect(items2[0]?.name).toBe('Artist 2');
      expect(items2[1]?.name).toBe('Artist 3');
      const { data: data3 } = await listAlbumAssociationsWithTracks({
        offset: 2,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { associations: items3, total: total3 } = data3 || { associations: [], total: 0 };
      expect(total3).toBe(3);
      expect(items3.length).toBe(1);
      expect(items3[0]?.name).toBe('Artist 3');
    });
  });
});
