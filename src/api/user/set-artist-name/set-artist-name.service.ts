import { AssociationTypeEnum } from 'src/types/enums';
import { CustomDataService } from 'src/custom-data/custom-data.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserSetArtistNameService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
    private readonly libraryService: LibraryService,
  ) {}

  async setArtistName(accountId: number, artistId: number, name: string) {
    const albumAssociations = await this.libraryService.retrieveAlbumAssociation(
      accountId,
      artistId,
      AssociationTypeEnum.ARTIST,
    );
    if (!albumAssociations?.length) {
      const trackAssociations = await this.libraryService.retrieveTrackAssociation(
        accountId,
        artistId,
        AssociationTypeEnum.ARTIST,
      );
      if (!trackAssociations?.length) {
        throw new NotFoundException(ErrorCodes.ARTIST_NOT_FOUND_ERROR);
      }
    }
    const trackIds1 = await this.customDataService.setCustomAlbumArtistName(accountId, artistId, name);
    const trackIds2 = await this.customDataService.setCustomTrackArtistName(accountId, artistId, name);
    const trackIds = [...trackIds1, ...trackIds2];
    for (let i = 0, len = trackIds.length; i < len; i += 1) {
      const trackId = trackIds[i];
      if (trackId) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(trackId);
      }
    }
  }
}
