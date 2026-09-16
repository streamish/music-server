import { ErrorCodes } from 'src/constants/error-codes';
import { FileCustomDataEntity, FileEntity } from 'src/database/entities';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserSetCustomFileDataBodyDto } from './set-custom-file-data.dto';

@Injectable()
export class UserSetCustomFileDataService {
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FileCustomDataEntity)
    private readonly fileCustomDataEntity: typeof FileCustomDataEntity,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
  ) {}

  async setCustomFileData(accountId: number, fileId: number, body: UserSetCustomFileDataBodyDto): Promise<void> {
    const file = await this.fileEntity.findOne({ where: { id: fileId, accountId } });
    if (!file) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    const existingCustomData = await this.fileCustomDataEntity.findOne({ where: { fileId } });
    if (existingCustomData) {
      await this.fileCustomDataEntity.update(
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
        { where: { id: fileId } },
      );
    } else {
      await this.fileCustomDataEntity.create({
        id: fileId,
        fileId,
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
      } as FileCustomDataEntity);
    }
    await this.indexerService.scanFile(fileId);
  }
}
