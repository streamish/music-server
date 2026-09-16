import { CustomDataService } from 'src/custom-data/custom-data.service';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserSetComposerNameService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setComposerName(accountId: number, composerId: number, name: string) {
    const trackIds = await this.customDataService.setCustomTrackComposerName(accountId, composerId, name);
    for (let i = 0, len = trackIds.length; i < len; i += 1) {
      const trackId = trackIds[i];
      if (trackId) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(trackId);
      }
    }
  }
}
