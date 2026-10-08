import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  AuthenticatedApiClient,
  createAuthenticatedApi,
  emptyAuthToken,
  unauthenticatedApi,
} from '../../../test-helper';
import { AssociationSortFieldEnum, AssociationTypeEnum, SortDirectionEnum, paths } from '../../../types/api-schema';
import { ErrorCodes } from '../../../constants/error-codes';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/users/list-track-items-with-tracks', () => {
  let userApi: AuthenticatedApiClient;

  beforeAll(async () => {
    userApi = await createAuthenticatedApi(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  async function listTrackAssociationsWithTracks(
    query: paths['/api/user/list-track-associations-with-tracks']['get']['parameters']['query'],
  ) {
    return userApi.GET('/api/user/list-track-associations-with-tracks', {
      params: {
        ...emptyAuthToken.params,
        query,
      },
    });
  }

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await unauthenticatedApi.GET(`/api/user/list-track-associations-with-tracks`, {
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
      const { error } = await listTrackAssociationsWithTracks({
        addedAfter: 'invalid-date',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_AFTER_ERROR);
    });

    it('should reject invalid addedBefore date', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        addedBefore: 'invalid-date',
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ADDED_BEFORE_ERROR);
    });

    it('should reject invalid filter', async () => {
      const { error } = await listTrackAssociationsWithTracks({
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
      const { error } = await listTrackAssociationsWithTracks({
        genre: ['x'.repeat(300)],
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_GENRE_LENGTH_ERROR);
    });

    it('should reject negative limit', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        offset: 0,
        limit: -1000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject excessive "limit"', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        offset: 0,
        limit: 1_000_000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject invalid limit', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        offset: 0,
        limit: 'asdf' as unknown as number,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_LIMIT_ERROR);
    });

    it('should reject negative offset', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        offset: -1000,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid offset', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        offset: 'asdf' as unknown as number,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_OFFSET_ERROR);
    });

    it('should reject invalid sortDirection', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        sortDirection: 'invalid-direction' as SortDirectionEnum,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_ORDER_ERROR);
    });

    it('should reject invalid sortField', async () => {
      const { error } = await listTrackAssociationsWithTracks({
        sortField: 'invalid-field' as unknown as AssociationSortFieldEnum,
        associationType: AssociationTypeEnum.artist,
      });
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_SORT_FIELD_ERROR);
    });
  });

  describe('edge cases', () => {
    describe('filter', () => {
      it('should filter by genre', async () => {
        const { data } = await listTrackAssociationsWithTracks({
          genre: ['Rock'],
          associationType: AssociationTypeEnum.artist,
        });
        const { items, total } = data || { items: [], total: 0 };
        expect(total).toBe(2);
        expect(items.length).toBe(2);
        expect(items[0]?.name).toBe('Artist 1');
        expect(items[1]?.name).toBe('Artist 3, Artist 2');
      });

      it('should filter by search term', async () => {
        const { data } = await listTrackAssociationsWithTracks({
          filter: '3',
          associationType: AssociationTypeEnum.artist,
        });
        const { items, total } = data || { items: [], total: 0 };
        expect(total).toBe(3);
        expect(items.length).toBe(3);
        expect(items[0]?.name).toBe('Artist 3');
        expect(items[1]?.name).toBe('Artist 3 ft. Artist 2');
        expect(items[2]?.name).toBe('Artist 3, Artist 2');
      });
    });

    describe('sort', () => {
      it('should sort by artist ASC', async () => {
        const { data } = await listTrackAssociationsWithTracks({
          sortField: AssociationSortFieldEnum.name,
          sortDirection: SortDirectionEnum.asc,
          associationType: AssociationTypeEnum.artist,
        });
        const { items, total } = data || { items: [], total: 0 };
        expect(total).toBe(5);
        expect(items.length).toBe(5);
        expect(items[0]?.name).toBe('Artist 1');
        expect(items[1]?.name).toBe('Artist 2');
        expect(items[2]?.name).toBe('Artist 3');
        expect(items[3]?.name).toBe('Artist 3 ft. Artist 2');
        expect(items[4]?.name).toBe('Artist 3, Artist 2');
      });

      it('should sort by artist DESC', async () => {
        const { data } = await listTrackAssociationsWithTracks({
          sortField: AssociationSortFieldEnum.name,
          sortDirection: SortDirectionEnum.desc,
          associationType: AssociationTypeEnum.artist,
        });
        const { items, total } = data || { items: [], total: 0 };
        expect(total).toBe(5);
        expect(items.length).toBe(5);
        expect(items[0]?.name).toBe('Artist 3, Artist 2');
        expect(items[1]?.name).toBe('Artist 3 ft. Artist 2');
        expect(items[2]?.name).toBe('Artist 3');
        expect(items[3]?.name).toBe('Artist 2');
        expect(items[4]?.name).toBe('Artist 1');
      });
    });
  });

  describe('success', () => {
    it('should return all artists', async () => {
      const { data } = await listTrackAssociationsWithTracks({ associationType: AssociationTypeEnum.artist });
      const { items, total } = data || { items: [], total: 0 };
      expect(total).toBe(5);
      expect(items.length).toBe(5);
      for (let i = 0; i < items.length; i += 1) {
        const artist = items[i];
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
      const { data } = await listTrackAssociationsWithTracks({
        offset: 0,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { items, total } = data || { items: [], total: 0 };
      expect(total).toBe(5);
      expect(items.length).toBe(2);
      expect(items[0]?.name).toBe('Artist 1');
      expect(items[1]?.name).toBe('Artist 2');
      const { data: data2 } = await listTrackAssociationsWithTracks({
        offset: 1,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { items: associations2, total: total2 } = data2 || { items: [], total: 0 };
      expect(total2).toBe(5);
      expect(associations2.length).toBe(2);
      expect(associations2[0]?.name).toBe('Artist 2');
      expect(associations2[1]?.name).toBe('Artist 3');
      const { data: data3 } = await listTrackAssociationsWithTracks({
        offset: 2,
        limit: 2,
        associationType: AssociationTypeEnum.artist,
      });
      const { items: associations3, total: total3 } = data3 || { items: [], total: 0 };
      expect(total3).toBe(5);
      expect(associations3.length).toBe(2);
      expect(associations3[0]?.name).toBe('Artist 3');
      expect(associations3[0]?.name).toBe('Artist 3');
      expect(associations3[1]?.name).toBe('Artist 3 ft. Artist 2');
    });
  });
});
