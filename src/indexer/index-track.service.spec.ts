import { IndexTrackService } from './index-track.service';
import { describe, expect, it, jest } from '@jest/globals';

describe('IndexTrackService.listIndexedFiles', () => {
  it('should return dates as Date objects when the database returns raw strings', async () => {
    const trackEntity = {
      findAll: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([
        { id: 1, filePath: '/a.mp3', fileMtime: '2020-01-01 10:20:30.123 +00:00' },
        { id: 2, filePath: '/b.mp3', fileMtime: '2020-01-01 10:20:30.123 +00:00' },
      ]),
    };
    const customDataEntity = {
      findAll: jest
        .fn<() => Promise<unknown[]>>()
        .mockResolvedValue([{ id: 2, createdAt: '2021-01-01 00:00:00.000 +00:00', updatedAt: null }]),
    };
    const service = new IndexTrackService(trackEntity as never, customDataEntity as never);
    const files = await service.listIndexedFiles(1, 1);
    expect(files[0]!.fileMtime).toBeInstanceOf(Date);
    expect(files[0]!.fileMtime.toISOString()).toBe('2020-01-01T10:20:30.123Z');
    // a track with custom data reports the custom data date
    expect(files[1]!.fileMtime.toISOString()).toBe('2021-01-01T00:00:00.000Z');
  });
});
