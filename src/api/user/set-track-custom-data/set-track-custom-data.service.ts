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

  async setTrackData(accountId: number, fileId: number, customData: UserSetTrackCustomDataBodyDto) {
    await this.customDataService.setCustomTrackData(
      accountId,
      fileId,
      customData.title,
      customData.artists,
      customData.composers,
      customData.genres,
      customData.comment,
      customData.discNumber,
      customData.trackNumber,
      customData.year,
    );
    await this.indexerService.scanFile(fileId);
  }
}
