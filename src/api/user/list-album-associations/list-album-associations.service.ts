import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumAssociationsQueryDto } from './list-album-associations.dto';

@Injectable()
export class UserListAlbumAssociationsService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAssociations(accountId: number, query: UserListAlbumAssociationsQueryDto) {
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
      offset: query.offset || 0,
      total: data.total,
    };
  }
}
