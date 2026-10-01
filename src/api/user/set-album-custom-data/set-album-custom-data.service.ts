import { AlbumEntity } from 'src/database/entities/album.entity';
import { CustomDataService } from 'src/custom-data/custom-data.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserSetAlbumCustomDataBodyDto } from './set-album-custom-data.dto';

@Injectable()
export class UserSetAlbumCustomDataService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setAlbumData(accountId: number, albumId: number, customData: UserSetAlbumCustomDataBodyDto) {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'accountId', 'title'],
      where: {
        accountId,
        id: albumId,
      },
    });
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
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
