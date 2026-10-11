import { AssociationTypeEnum } from 'src/types/enums';
import { AssociationWithCreditsDto, ListAlbumAssociationsQueryDto, ListTrackAssociationsQueryDto } from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class ApiAssociationsService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Lists associations collated from albums based on the filters provided.  The album artists are defined
   * in the album information, the genres and composers are compiled from track information.
   * @param {number} accountId The authenticated user
   * @param {ListAlbumAssociationsQueryDto} query Optional query filters
   * @returns {ListAssociationsResponseDto} Paginated dataset of associations
   * @returns
   */
  async listAlbumAssociations(accountId: number, query: ListAlbumAssociationsQueryDto) {
    const data = await this.libraryService.listAlbumAssociations(
      accountId,
      {
        ...query,
        isArtist: query.associationType === AssociationTypeEnum.ARTIST,
        isComposer: query.associationType === AssociationTypeEnum.COMPOSER,
        isGenre: query.associationType === AssociationTypeEnum.GENRE,
      },
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      associations: data.items,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    };
  }

  /**
   * Lists associations collated from albums including the association's track-lists based on the filters
   * provided.  The  album artists  are defined in the album information, the genres and composers are
   * compiled from track information.
   * @param {number} accountId The authenticated user
   * @param {ListAlbumAssociationsQueryDto} query Optional query filters
   * @returns {ListAssociationsResponseDto} Paginated dataset of associations
   */
  async listAlbumAssociationsWithTracks(accountId: number, query: ListAlbumAssociationsQueryDto) {
    const data = await this.libraryService.listAlbumAssociations(
      accountId,
      {
        ...query,
        isArtist: query.associationType === AssociationTypeEnum.ARTIST,
        isComposer: query.associationType === AssociationTypeEnum.COMPOSER,
        isGenre: query.associationType === AssociationTypeEnum.GENRE,
      },
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    const associations = await this.libraryService.retrieveAlbumAssociation(
      accountId,
      data.items.map((association) => association.id),
      query.associationType,
    );
    return {
      associations,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    };
  }

  /**
   * Lists associations collated from tracks based on the filters provided.  The track artists, genres and
   * composers are compiled from track information.
   * @param {number} accountId The authenticated user
   * @param {ListTrackAssociationsQueryDto} query Optional query filters
   * @returns {ListAssociationsResponseDto} Paginated dataset of associations
   */
  async listTrackAssociations(accountId: number, query: ListTrackAssociationsQueryDto) {
    const data = await this.libraryService.listTrackAssociations(
      accountId,
      {
        ...query,
        isArtist: query.associationType === AssociationTypeEnum.ARTIST,
        isComposer: query.associationType === AssociationTypeEnum.COMPOSER,
        isGenre: query.associationType === AssociationTypeEnum.GENRE,
      },
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      associations: data.items,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    };
  }

  /**
   * Lists associations collated from tracks including the association's track-lists based on the filters
   * provided.  The track artists, genres and composers are compiled from track information.
   * @param {number} accountId The authenticated user
   * @param {ListTrackAssociationsQueryDto} query Optional query filters
   * @returns {ListAssociationsResponseDto} Paginated dataset of associations
   */
  async listTrackAssociationsWithTracks(accountId: number, query: ListTrackAssociationsQueryDto) {
    const assocationData = await this.listTrackAssociations(accountId, query);
    // collate the track information
    const associationIds = assocationData.associations.map((association) => association.id);
    const assocationsWithTracks = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationIds,
      query.associationType,
    );
    return {
      ...assocationData,
      associations: assocationsWithTracks,
    };
  }

  /**
   * Retrieves a single assocation along with any albums and tracks they have been credited to.
   * @param {number} accountId The authenticated user
   * @param {number} associationId The association to retrieve
   * @throws {NotFoundException} If the specified association is not found
   * @returns {AssociationWithCreditsDto} The assocatiation with all credits
   */
  async retrieveAssociation(accountId: number, associationId: number): Promise<AssociationWithCreditsDto> {
    const albumArtist = await this.libraryService.retrieveAlbumAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackArtist = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackComposer = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.COMPOSER,
    );
    const trackGenre = await this.libraryService.retrieveTrackAssociation(
      accountId,
      associationId,
      AssociationTypeEnum.GENRE,
    );
    const identity = albumArtist[0] || trackArtist[0] || trackComposer[0] || trackGenre[0] || null;
    if (!identity) {
      throw new NotFoundException(ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR);
    }
    return {
      id: identity.id,
      name: identity.name,
      createdAt: identity.createdAt,
      albumArtistCredits: albumArtist[0]?.albums || [],
      artistCredits: trackArtist[0]?.albums || [],
      composerCredits: trackComposer[0]?.albums || [],
      genreCredits: trackGenre[0]?.albums || [],
    };
  }
}
