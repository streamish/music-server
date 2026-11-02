import {
  AlbumEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  TrackEntity,
} from 'src/database/entities';
import { PlaylistTypeEnum } from 'src/types/enums';
import { PlaylistsService } from './playlists.service';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { getModelToken } from '@nestjs/sequelize';

describe('PlaylistsService playlist cover colors', () => {
  type Palette = {
    coverImageDarkMuted: string | null;
    coverImageDarkVibrant: string | null;
    coverImageLightMuted: string | null;
    coverImageLightVibrant: string | null;
    coverImageMuted: string | null;
    coverImageVibrant: string | null;
  };
  const firstPalette: Palette = {
    coverImageDarkMuted: '#111111',
    coverImageDarkVibrant: '#222222',
    coverImageLightMuted: '#333333',
    coverImageLightVibrant: '#444444',
    coverImageMuted: '#555555',
    coverImageVibrant: '#666666',
  };
  const album = { ...firstPalette, coverImage: Buffer.from('cover'), coverImageMimeType: 'image/png' };
  const playlistEntity = { findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>() };
  const playlistItemEntity = { findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>() };
  const trackEntity = { findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>() };
  let service: PlaylistsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        { provide: getModelToken(AlbumEntity), useValue: {} },
        { provide: getModelToken(PlaylistEntity), useValue: playlistEntity },
        { provide: getModelToken(PlaylistItemEntity), useValue: playlistItemEntity },
        { provide: getModelToken(PlaylistSmartRuleEntity), useValue: {} },
        { provide: getModelToken(TrackEntity), useValue: trackEntity },
      ],
    }).compile();
    service = moduleRef.get(PlaylistsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('uses the first cover-bearing track of a normal playlist', async () => {
    playlistEntity.findOne.mockResolvedValue({ id: 1, type: PlaylistTypeEnum.NORMAL });
    playlistItemEntity.findOne.mockResolvedValue({ track: { album } });
    await expect(service.getCoverColors(1, 1)).resolves.toEqual(firstPalette);
  });

  it('returns no colors for a normal playlist without covers', async () => {
    playlistEntity.findOne.mockResolvedValue({ id: 1, type: PlaylistTypeEnum.NORMAL });
    playlistItemEntity.findOne.mockResolvedValue(null);
    await expect(service.getCoverColors(1, 1)).resolves.toEqual({});
  });

  it('uses the matching tracks of a smart playlist', async () => {
    playlistEntity.findOne.mockResolvedValue({ id: 1, type: PlaylistTypeEnum.SMART });
    jest.spyOn(service, 'getSmartPlaylistTrackIds').mockResolvedValue([2, 4]);
    trackEntity.findOne.mockResolvedValue({ album });
    await expect(service.getCoverColors(1, 1)).resolves.toEqual(firstPalette);
  });

  it('returns no colors for a smart playlist without matching tracks', async () => {
    playlistEntity.findOne.mockResolvedValue({ id: 1, type: PlaylistTypeEnum.SMART });
    jest.spyOn(service, 'getSmartPlaylistTrackIds').mockResolvedValue([]);
    await expect(service.getCoverColors(1, 1)).resolves.toEqual({});
  });
});
