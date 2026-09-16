import { CustomDataService } from 'src/custom-data/custom-data.service';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UserSetGenreNameService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setGenreName(accountId: number, genreId: number, name: string) {
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
