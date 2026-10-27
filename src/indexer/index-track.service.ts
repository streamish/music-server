import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { Transaction } from 'sequelize';
import { normalizeString, sanitizeString } from 'src/utils/strings';
import type { IndexedFile } from './types';

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
   * @param trackId The ID of the file in the database
   * @param embeddedData The embedded metadata detected in the file
   * @returns Consolidated metadata object prioritizing custom data
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
   * Returns every indexed file of a root path with the date used to detect changes.  A track with custom data
   * reports the date its custom data was last saved instead of the file's date, which never matches the file on
   * disk and so causes the track to be re-indexed.
   * @param accountId The media owner account ID
   * @param rootPathId The root path the files belong to
   * @returns The ID, path and change-detection date of each indexed file
   */
  async listIndexedFiles(accountId: number, rootPathId: number): Promise<IndexedFile[]> {
    const tracks = await this.trackEntity.findAll({
      where: { accountId, rootPathId },
      attributes: ['id', 'filePath', 'fileMtime'],
      raw: true,
    });
    // custom data is a small set of user overrides, so it is loaded whole rather than with a very large `IN` filter
    const customData = await this.trackCustomDataEntity.findAll({
      attributes: ['id', 'createdAt', 'updatedAt'],
      raw: true,
    });
    const customDataDates = new Map(customData.map((item) => [item.id, item.updatedAt || item.createdAt]));
    // raw rows return dates as strings or numbers depending on the dialect, so they are normalized here
    return tracks.map((track) => ({
      id: track.id,
      filePath: track.filePath,
      fileMtime: new Date(customDataDates.get(track.id) || track.fileMtime),
    }));
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
