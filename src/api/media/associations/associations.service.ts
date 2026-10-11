import { AssociationTypeEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { ListAlbumAssociationsQueryDto, ListAssociationsResponseDto, ListTrackAssociationsQueryDto } from './dtos';

@Injectable()
export class ApiAssociationsService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Lists associations collated from albums based on the filters provided.  The album artists are defined
   * in the album information, the genres and composers are compiled from track information.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of associations
   */
  async listAlbumAssociations(userId: number, query: ListAlbumAssociationsQueryDto) {
    const data = await this.libraryService.listAlbumAssociations(
      userId,
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
    } as unknown as ListAssociationsResponseDto;
  }

  /**
   * Lists associations collated from albums including the association's track-lists based on the filters
   * provided.  The  album artists  are defined in the album information, the genres and composers are
   * compiled from track information.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of associations
   */
  async listAlbumAssociationsWithTracks(userId: number, query: ListAlbumAssociationsQueryDto) {
    const data = await this.libraryService.listAlbumAssociations(
      userId,
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
      userId,
      data.items.map((association) => association.id),
      query.associationType,
    );
    return {
      associations,
      limit: query.limit || 100_000,
      offset: query.offset || 0,
      total: data.total,
    } as unknown as ListAssociationsResponseDto;
  }

  /**
   * Lists associations collated from tracks based on the filters provided.  The track artists, genres and
   * composers are compiled from track information.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of associations
   */
  async listTrackAssociations(userId: number, query: ListTrackAssociationsQueryDto) {
    const data = await this.libraryService.listTrackAssociations(
      userId,
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
    } as unknown as ListAssociationsResponseDto;
  }

  /**
   * Lists associations collated from tracks including the association's track-lists based on the filters
   * provided.  The track artists, genres and composers are compiled from track information.
   * @param userId The authenticated user ID
   * @param query Optional query filters
   * @returns Paginated dataset of associations
   */
  async listTrackAssociationsWithTracks(userId: number, query: ListTrackAssociationsQueryDto) {
    const assocationData = await this.listTrackAssociations(userId, query);
    // collate the track information
    const associationIds = (assocationData.associations || []).map((association) => association.id);
    const assocationsWithTracks = await this.libraryService.retrieveTrackAssociation(
      userId,
      associationIds,
      query.associationType,
    );
    return {
      ...assocationData,
      associations: assocationsWithTracks,
    } as unknown as ListAssociationsResponseDto;
  }

  /**
   * Retrieves a single assocation along with any albums and tracks they have been credited to.
   * @param userId The authenticated user ID
   * @param associationId The association to retrieve
   * @throws If the specified association is not found
   * @returns The assocatiation with all credits
   */
  async retrieveAssociation(userId: number, associationId: number) {
    const albumArtist = await this.libraryService.retrieveAlbumAssociation(
      userId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackArtist = await this.libraryService.retrieveTrackAssociation(
      userId,
      associationId,
      AssociationTypeEnum.ARTIST,
    );
    const trackComposer = await this.libraryService.retrieveTrackAssociation(
      userId,
      associationId,
      AssociationTypeEnum.COMPOSER,
    );
    const trackGenre = await this.libraryService.retrieveTrackAssociation(
      userId,
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
