import { AssociationTypeEnum } from 'src/types/enums';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserSetAssociationFavoriteService {
  constructor(private readonly libraryService: LibraryService) {}

  async setAssociationFavorite(
    accountId: number,
    associationId: number,
    associationType: AssociationTypeEnum,
  ): Promise<void> {
    await this.libraryService.setAssociationFavorite(accountId, associationId, associationType);
  }
}
