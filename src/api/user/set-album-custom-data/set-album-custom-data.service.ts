import { CustomDataService } from 'src/custom-data/custom-data.service';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';
import { UserSetAlbumCustomDataBodyDto } from './set-album-custom-data.dto';

@Injectable()
export class UserSetAlbumCustomDataService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setAlbumData(accountId: number, albumId: number, customData: UserSetAlbumCustomDataBodyDto) {
    // apply the custom data to all tracks
    const trackIds = await this.customDataService.setCustomAlbumData(
      accountId,
      albumId,
      customData.title,
      customData.artists,
      customData.year,
    );
    // reindex each track, SQLite requires sequential processing
    for (let i = 0, len = trackIds.length; i < len; i += 1) {
      const trackId = trackIds[i];
      if (trackId) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(trackId);
      }
    }
  }
}
