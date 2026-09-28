import { CustomDataService } from 'src/custom-data/custom-data.service';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';
import { UserSetTrackCustomDataBodyDto } from './set-track-custom-data.dto';

@Injectable()
export class UserSetTrackCustomDataService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setTrackData(accountId: number, trackId: number, customData: UserSetTrackCustomDataBodyDto) {
    await this.customDataService.setCustomTrackData(
      accountId,
      trackId,
      customData.title,
      customData.artists,
      customData.composers || '',
      customData.genres || '',
      customData.comment || '',
      customData.discNumber || 0,
      customData.trackNumber || 0,
      customData.year || 0,
    );
    await this.indexerService.scanFile(trackId);
  }
}
