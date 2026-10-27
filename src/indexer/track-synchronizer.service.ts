import { AssociationTypeEnum } from 'src/types/enums';
import { IndexAssociationService } from './index-association.service';
import { IndexTrackService } from './index-track.service';
import { Injectable } from '@nestjs/common';
import type { IAudioMetadata } from 'src/types/music-metadata';

const ASSOCIATION_TYPES = [AssociationTypeEnum.ARTIST, AssociationTypeEnum.COMPOSER, AssociationTypeEnum.GENRE];

/**
 * Copies embedded file metadata into the database for a track that already exists.
 */
@Injectable()
export class TrackSynchronizerService {
  constructor(
    private readonly indexAssociationService: IndexAssociationService,
    private readonly indexTrackService: IndexTrackService,
  ) {}

  /**
   * Updates the track and its artist, composer and genre associations, then re-syncs the album associations.
   * @param accountId The owner of the track
   * @param trackId The ID of the track in the database
   * @param embeddedData The metadata extracted from the file
   * @returns The updated track
   */
  async syncTrack(accountId: number, trackId: number, embeddedData: IAudioMetadata) {
    const track = await this.indexTrackService.updateTrack(embeddedData, trackId, accountId);
    for (let i = 0; i < ASSOCIATION_TYPES.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.indexAssociationService.updateAssociations(embeddedData, accountId, ASSOCIATION_TYPES[i]!, track);
    }
    await this.indexAssociationService.syncAlbumAssociations(track.albumId);
    return track;
  }
}
