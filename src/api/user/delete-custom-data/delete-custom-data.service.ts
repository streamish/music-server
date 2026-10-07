import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TrackCustomDataEntity } from 'src/database/entities/track-custom-data.entity';
import { TrackEntity } from 'src/database/entities';

@Injectable()
export class UserDeleteCustomDataService {
  constructor(
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(TrackCustomDataEntity)
    private readonly trackCustomDataEntity: typeof TrackCustomDataEntity,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async deleteCustomData(accountId: number, fileId: number): Promise<void> {
    const file = await this.trackEntity.findOne({ where: { id: fileId, accountId } });
    if (!file) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    await this.trackCustomDataEntity.destroy({ where: { id: fileId } });
    await this.indexerService.scanFile(fileId);
  }
}
