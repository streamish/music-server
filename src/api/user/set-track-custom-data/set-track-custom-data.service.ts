import { CustomDataService } from 'src/custom-data/custom-data.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TrackEntity } from 'src/database/entities/track.entity';
import { UserSetTrackCustomDataBodyDto } from './set-track-custom-data.dto';

@Injectable()
export class UserSetTrackCustomDataService {
  constructor(
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  async setTrackData(accountId: number, trackId: number, customData: UserSetTrackCustomDataBodyDto) {
    const track = await this.trackEntity.findOne({
      attributes: ['id', 'accountId', 'title'],
      where: { id: trackId, accountId },
    });
    if (!track) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }
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
