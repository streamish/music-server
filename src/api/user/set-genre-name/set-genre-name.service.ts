import { AssociationTypeEnum } from 'src/types/enums';
import { CustomDataService } from 'src/custom-data/custom-data.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserSetGenreNameService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
    private readonly libraryService: LibraryService,
  ) {}

  async setGenreName(accountId: number, genreId: number, name: string) {
    const albumAssociations = await this.libraryService.retrieveAlbumAssociation(
      accountId,
      genreId,
      AssociationTypeEnum.GENRE,
    );
    if (!albumAssociations?.length) {
      const trackAssociations = await this.libraryService.retrieveTrackAssociation(
        accountId,
        genreId,
        AssociationTypeEnum.GENRE,
      );
      if (!trackAssociations?.length) {
        throw new NotFoundException(ErrorCodes.GENRE_NOT_FOUND_ERROR);
      }
    }
    const trackIds = await this.customDataService.setCustomTrackGenreName(accountId, genreId, name);
    for (let i = 0, len = trackIds.length; i < len; i += 1) {
      const trackId = trackIds[i];
      if (trackId) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(trackId);
      }
    }
  }
}
