import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListTrackAssociationsWithTracksQueryDto } from './list-track-associations-with-tracks.dto';

@Injectable()
export class UserListTrackAssociationsWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAssociationsWithTracks(accountId: number, query: UserListTrackAssociationsWithTracksQueryDto) {
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
    const items = await this.libraryService.retrieveTrackAssociation(
      accountId,
      data.items.map((association) => association.id),
      query.associationType,
    );
    return {
      items,
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
