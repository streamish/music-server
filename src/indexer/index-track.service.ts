import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { Transaction } from 'sequelize';
import { normalizeString, sanitizeString } from 'src/utils/strings';

@Injectable()
export class IndexTrackService {
  private readonly logger: Logger = new Logger(IndexTrackService.name);

  constructor(
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @InjectModel(TrackCustomDataEntity)
    private readonly trackCustomDataEntity: typeof TrackCustomDataEntity,
  ) {}

  /**
   * Merges custom file data into the embedded metadata detected in a track, creating
   * a consolidated metadata object that combines both sources.
   * @param {number} trackId The ID of the file in the database
   * @param {IAudioMetadata} embeddedData The embedded metadata detected in the file
   * @returns {IAudioMetadata} Consolidated metadata object prioritizing custom data
   */
  async applyCustomTrackData(trackId: number, embeddedData: IAudioMetadata): Promise<IAudioMetadata> {
    const customData = await this.trackCustomDataEntity.findOne({
      where: {
        trackId,
      },
    });
    if (!customData) {
      return embeddedData;
    }
    const combined = embeddedData;
    combined.common.album = customData.albumTitle || embeddedData.common?.album;
    combined.common.albumartists = customData.albumArtists?.split(',') || embeddedData.common?.albumartists;
    combined.common.albumartist = combined.common.albumartists.join(', ');
    combined.common.artists = customData.artists?.split(',') || embeddedData.common?.artists || [];
    combined.common.artist = combined.common.artists.join(', ');
    combined.common.comment =
      customData.comment?.split('\n').map((comment) => {
        return { text: comment.trim() };
      }) ??
      embeddedData.common?.comment ??
      null;
    combined.common.composer =
      customData.composers?.split(',').map((composer) => composer.trim()) ?? embeddedData.common?.composer;
    combined.common.disk = combined.common.disk || {};
    combined.common.disk.no = customData.discNumber || embeddedData.common?.disk?.no || null;
    combined.common.genre = customData.genres?.split(',').map((genre) => genre.trim()) ?? embeddedData.common?.genre;
    combined.common.title = customData.title || embeddedData.common?.title || '';
    combined.common.track = combined.common.track || {};
    combined.common.track.no = customData.trackNumber || embeddedData.common?.track?.no || null;
    combined.common.year = customData.year || embeddedData.common?.year || undefined;
    return combined;
  }

  /**
   * Returns a file by path with the specified attributes, including any custom data overrides if available.
   * @param {number} accountId The ID of the account owning the file
   * @param {string} filePath The path to the file on disk
   * @param {Transaction} [transaction] Optional Sequelize transaction to use
   * @returns {Promise<TrackEntity | undefined>} The file entity with potential data overrides
   */
  async retrieveLastModified(accountId: number, filePath: string, transaction?: Transaction) {
    const track = await this.trackEntity.findOne({
      where: {
        filePath,
        accountId,
      },
      attributes: ['id', 'fileMtime'],
      transaction,
    });
    if (!track) {
      return undefined;
    }
    const customData = await this.trackCustomDataEntity.findOne({
      where: {
        id: track.id,
      },
      attributes: ['id', 'updatedAt'],
      transaction,
    });
    if (!customData) {
      return track;
    }
    return {
      id: track.id,
      fileMtime: customData?.updatedAt || customData?.createdAt || track.fileMtime,
    };
  }

  async updateTrack(embeddedData: IAudioMetadata, trackId: number, accountId: number, transaction?: Transaction) {
    const track = await this.trackEntity.findByPk(trackId, { transaction });
    if (!track) {
      throw new Error(`Track with id ${trackId} not found`);
    }
    const commentText = embeddedData.common.comment
      ?.map((comment) => comment.text?.trim() || '')
      .join('\n')
      .trim();
    await this.trackEntity.update(
      {
        accountId,
        bitRate: embeddedData.format.bitrate || 0,
        channels: embeddedData.format.numberOfChannels || 0,
        comment: commentText ?? '',
        discNumber: embeddedData.common.disk?.no || 0,
        duration: embeddedData.format.duration || 0,
        frequency: embeddedData.format.sampleRate || 0,
        title: sanitizeString(embeddedData.common.title || '') || '',
        titleNormalized: normalizeString(embeddedData.common.title || '') || '',
        trackNumber: embeddedData.common.track?.no || 0,
        year: embeddedData.common.year || 0,
      },
      {
        where: {
          id: trackId,
        },
        transaction,
      },
    );
    return track.reload({
      transaction,
    });
  }
}
