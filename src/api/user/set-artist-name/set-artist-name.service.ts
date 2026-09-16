import { CustomDataService } from 'src/custom-data/custom-data.service';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserSetArtistNameService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setArtistName(accountId: number, artistId: number, name: string) {
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
