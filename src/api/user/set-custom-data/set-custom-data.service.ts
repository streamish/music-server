import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { UserSetCustomDataBodyDto } from './set-custom-data.dto';

@Injectable()
export class UserSetCustomDataService {
  constructor(
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(TrackCustomDataEntity)
    private readonly trackCustomDataEntity: typeof TrackCustomDataEntity,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setCustomFileData(accountId: number, trackId: number, body: UserSetCustomDataBodyDto): Promise<void> {
    const file = await this.trackEntity.findOne({ where: { id: trackId, accountId } });
    if (!file) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const existingCustomData = await this.trackCustomDataEntity.findOne({ where: { trackId } });
    if (existingCustomData) {
      await this.trackCustomDataEntity.update(
        {
          albumArtists: body.albumArtists !== undefined ? body.albumArtists : existingCustomData.albumArtists,
          albumTitle: body.albumTitle !== undefined ? body.albumTitle : existingCustomData.albumTitle,
          artists: body.artists !== undefined ? body.artists : existingCustomData.artists,
          comment: body.comment !== undefined ? body.comment : existingCustomData.comment,
          composers: body.composers !== undefined ? body.composers : existingCustomData.composers,
          discNumber: body.discNumber !== undefined ? body.discNumber : existingCustomData.discNumber,
          genres: body.genres !== undefined ? body.genres : existingCustomData.genres,
          title: body.title !== undefined ? body.title : existingCustomData.title,
          trackNumber: body.trackNumber !== undefined ? body.trackNumber : existingCustomData.trackNumber,
          year: body.year !== undefined ? body.year : existingCustomData.year,
        },
        { where: { id: trackId } },
      );
    } else {
      await this.trackCustomDataEntity.create({
        id: trackId,
        trackId,
        albumArtists: body.albumArtists,
        albumTitle: body.albumTitle,
        artists: body.artists,
        comment: body.comment,
        composers: body.composers,
        discNumber: body.discNumber,
        genres: body.genres,
        title: body.title,
        trackNumber: body.trackNumber,
        year: body.year,
      } as TrackCustomDataEntity);
    }
    await this.indexerService.scanFile(trackId);
  }
}
