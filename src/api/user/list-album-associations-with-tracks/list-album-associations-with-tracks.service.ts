import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumAssociationsWithTracksQueryDto } from './list-album-associations-with-tracks.dto';

@Injectable()
export class UserListAlbumAssociationsWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAssociationsWithTracks(accountId: number, query: UserListAlbumAssociationsWithTracksQueryDto) {
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
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
