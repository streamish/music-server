import { AlbumEntity, AssociationEntity, TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { CustomDataService } from 'src/custom-data/custom-data.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SetAlbumCustomDataBodyDto } from './dtos/set-album-custom-data.dto';
import { SetCustomDataBodyDto, SetTrackCustomDataBodyDto } from './dtos';

@Injectable()
export class ApiCustomDataService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AssociationEntity)
    private readonly associationEntity: typeof AssociationEntity,
    private readonly customDataService: CustomDataService,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(TrackCustomDataEntity)
    private readonly trackCustomDataEntity: typeof TrackCustomDataEntity,
  ) {}

  /**
   * Deletse the custom data of a track.
   * @param userId The authenticated user ID
   * @param trackId Thbe track ID to uppdate
   * @throws If the specified track is not found
   */
  async deleteCustomData(userId: number, trackId: number) {
    const file = await this.trackEntity.findOne({ where: { id: trackId, accountId: userId } });
    if (!file) {
      throw new NotFoundException(ErrorCodes.FILE_NOT_FOUND_ERROR);
    }
    await this.trackCustomDataEntity.destroy({ where: { id: trackId } });
    await this.indexerService.scanFile(trackId);
  }

  /**
   * Assigns custom data to an album.
   * @param userId The authenticated user ID
   * @param albumId Thbe album ID to uppdate
   * @param customData The custom `title`, `artists`, `year` etc
   * @throws If the specified album is not found
   */
  async setAlbumData(userId: number, albumId: number, customData: SetAlbumCustomDataBodyDto) {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'accountId', 'title'],
      where: {
        accountId: userId,
        id: albumId,
      },
    });
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    // apply the custom data to all tracks
    const trackIds = await this.customDataService.setCustomAlbumData(
      userId,
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

  /**
   * Assigns custom name to an association.
   * @param userId The authenticated user ID
   * @param associationId The association ID to uppdate
   * @param name The new name value
   * @throws If the specified association is not found
   */
  async setAssociationName(userId: number, associationId: number, name: string) {
    const association = await this.associationEntity.findOne({
      where: {
        id: associationId,
        accountId: userId,
      },
      attributes: ['id'],
    });
    if (!association?.id) {
      throw new NotFoundException(ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR);
    }
    const trackIds1 = await this.customDataService.setCustomAlbumArtistName(userId, associationId, name);
    const trackIds2 = await this.customDataService.setCustomTrackArtistName(userId, associationId, name);
    const trackIds = [...trackIds1, ...trackIds2];
    for (let i = 0, len = trackIds.length; i < len; i += 1) {
      const trackId = trackIds[i];
      if (trackId) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(trackId);
      }
    }
  }

  /**
   * Assigns any of the full-set of possible custom data to a track.
   * @param userId The authenticated user ID
   * @param trackId The track ID to uppdate
   * @param customData The new `title`, `year`, `discNumber` etc
   * @throws If the specified track is not found
   */
  async setCustomData(userId: number, trackId: number, body: SetCustomDataBodyDto) {
    const track = await this.trackEntity.findOne({ where: { id: trackId, accountId: userId } });
    if (!track) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
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

  /**
   * Assigns custom data to a track.
   * @param userId The authenticated user ID
   * @param trackId The track ID to uppdate
   * @param customData The new `title`, `year`, `discNumber` etc
   * @throws If the specified track is not found
   */
  async setTrackData(userId: number, trackId: number, customData: SetTrackCustomDataBodyDto) {
    const track = await this.trackEntity.findOne({
      attributes: ['id', 'accountId', 'title'],
      where: { id: trackId, accountId: userId },
    });
    if (!track) {
      throw new NotFoundException(ErrorCodes.TRACK_NOT_FOUND_ERROR);
    }
    await this.customDataService.setCustomTrackData(
      userId,
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
