import { AssociationTypeEnum } from 'src/types/enums';
import { TrackSynchronizerService } from './track-synchronizer.service';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IAudioMetadata } from 'src/types/music-metadata';

describe('TrackSynchronizerService', () => {
  const embeddedData = {} as IAudioMetadata;
  const track = { id: 7, albumId: 42 };
  let calls: string[];
  let indexAssociationService: { updateAssociations: jest.Mock; syncAlbumAssociations: jest.Mock };
  let indexTrackService: { updateTrack: jest.Mock };
  let service: TrackSynchronizerService;

  beforeEach(() => {
    calls = [];
    indexTrackService = {
      updateTrack: jest.fn(async () => {
        calls.push('updateTrack');
        return track;
      }),
    };
    indexAssociationService = {
      updateAssociations: jest.fn(async (_data: unknown, _accountId: unknown, type: unknown) => {
        calls.push(`updateAssociations:${String(type)}`);
      }),
      syncAlbumAssociations: jest.fn(async () => {
        calls.push('syncAlbumAssociations');
      }),
    };
    service = new TrackSynchronizerService(indexAssociationService as never, indexTrackService as never);
  });

  it('should update the track, then artist, composer and genre associations, then the album associations', async () => {
    const result = await service.syncTrack(3, 7, embeddedData);

    expect(result).toBe(track);
    expect(indexTrackService.updateTrack).toHaveBeenCalledWith(embeddedData, 7, 3);
    expect(indexAssociationService.updateAssociations).toHaveBeenCalledWith(
      embeddedData,
      3,
      AssociationTypeEnum.ARTIST,
      track,
    );
    expect(calls).toEqual([
      'updateTrack',
      `updateAssociations:${AssociationTypeEnum.ARTIST}`,
      `updateAssociations:${AssociationTypeEnum.COMPOSER}`,
      `updateAssociations:${AssociationTypeEnum.GENRE}`,
      'syncAlbumAssociations',
    ]);
    expect(indexAssociationService.syncAlbumAssociations).toHaveBeenCalledWith(42);
  });

  it('should not sync album associations when an association update fails', async () => {
    indexAssociationService.updateAssociations.mockImplementationOnce(() => Promise.reject(new Error('db error')));

    await expect(service.syncTrack(3, 7, embeddedData)).rejects.toThrow('db error');

    expect(indexAssociationService.syncAlbumAssociations).not.toHaveBeenCalled();
  });
});
