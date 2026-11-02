import {
  AddPlaylistItemsBodyDto,
  CreateSmartPlaylistBodyDto,
  ListPlaylistItemsQueryDto,
  ListPlaylistsQueryDto,
  UpdateSmartPlaylistRulesBodyDto,
} from './dtos';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { PlaylistDto, PlaylistItemDto } from 'src/playlists/dtos';
import { PlaylistTypeEnum } from 'src/types/enums';
import { PlaylistsService } from 'src/playlists/playlists.service';

@Injectable()
export class ApiPlaylistsService {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly playlistsService: PlaylistsService,
  ) {}

  /**
   * Adds tracks and/or radio stations to a normal playlist.
   * @param userId The authenticated user ID
   * @param playlistId The ID of the playlist
   * @param body The items and optional insert offset
   * @returns The IDs of the created playlist items
   * @throws If the playlist is not found or is a smart playlist
   */
  async addItems(userId: number, playlistId: number, body: AddPlaylistItemsBodyDto) {
    return this.playlistsService.addItems(userId, playlistId, body.items, body.offset);
  }

  /**
   * Creates a normal playlist.
   * @param userId The authenticated user ID
   * @param name The name of the playlist
   * @returns The ID of the created playlist
   */
  async createPlaylist(userId: number, name: string) {
    const playlist = await this.playlistsService.createPlaylist(userId, name, PlaylistTypeEnum.NORMAL);
    return playlist.id;
  }

  /**
   * Creates a smart playlist.
   * @param userId The authenticated user ID
   * @param body The name and rules of the playlist
   * @returns The ID of the created playlist
   */
  async createSmartPlaylist(userId: number, body: CreateSmartPlaylistBodyDto) {
    const playlist = await this.playlistsService.createPlaylist(
      userId,
      body.name,
      PlaylistTypeEnum.SMART,
      body.rulesConjugal,
      body.rules,
    );
    return playlist.id;
  }

  /**
   * Deletes a playlist.
   * @param userId The authenticated user ID
   * @param playlistId The ID of the playlist
   * @throws If the playlist is not found
   */
  async deletePlaylist(userId: number, playlistId: number) {
    return this.playlistsService.deletePlaylist(userId, playlistId);
  }

  /**
   * Returns a paginated list of the user's playlists, including rules for smart playlists.
   * @param userId The authenticated user ID
   * @param query Pagination options
   * @returns Paginated dataset of playlists
   */
  async listPlaylists(
    userId: number,
    query: ListPlaylistsQueryDto,
  ): Promise<{ limit: number; offset: number; total: number; playlists: PlaylistDto[] }> {
    const limit = query.limit || 100_000;
    const offset = query.offset || 0;
    const { playlists, total } = await this.playlistsService.listPlaylists(userId, offset, limit);
    const playlistsWithCoverColors = await Promise.all(
      playlists.map(async (playlist) => {
        const coverColors = await this.playlistsService.getCoverColors(userId, playlist.id);
        return { ...playlist, ...coverColors };
      }),
    );
    return {
      limit,
      offset,
      total,
      playlists: playlistsWithCoverColors,
    };
  }

  /**
   * Returns the contents of a playlist.  Normal playlists return their saved tracks and radio stations in position
   * order, smart playlists return the library tracks that match their rules.
   * @param userId The authenticated user ID
   * @param query The playlist ID and pagination options
   * @returns Paginated dataset of playlist items
   * @throws If the playlist is not found
   */
  async listPlaylistItems(
    userId: number,
    query: ListPlaylistItemsQueryDto,
  ): Promise<{ limit: number; offset: number; total: number; playlistItems: PlaylistItemDto[] }> {
    const limit = query.limit || 100_000;
    const offset = query.offset || 0;
    const playlist = await this.playlistsService.getPlaylist(userId, query.id);
    if (playlist.type === PlaylistTypeEnum.SMART) {
      const trackIds = await this.playlistsService.getSmartPlaylistTrackIds(userId, playlist.id, limit, offset);
      const tracks = trackIds.length ? await this.libraryService.retrieveTrack(userId, trackIds) : [];
      const total = await this.playlistsService.countSmartPlaylistTracks(userId, playlist.id);
      return {
        limit,
        offset,
        total,
        playlistItems: tracks.map((track, i) => ({
          position: offset + i + 1,
          track,
        })),
      };
    }
    const { items, total } = await this.playlistsService.listItems(userId, playlist.id, offset, limit);
    const trackIds = [...new Set(items.map((item) => item.trackId).filter((id): id is number => !!id))];
    const tracks = trackIds.length ? await this.libraryService.retrieveTrack(userId, trackIds) : [];
    return {
      limit,
      offset,
      total,
      playlistItems: items.map((item) => ({
        id: item.id,
        position: item.position,
        ...(item.trackId
          ? { track: tracks.find((track) => track.id === item.trackId) }
          : {
              radioStationTitle: item.radioStationTitle || undefined,
              radioStationUrl: item.radioStationUrl || undefined,
            }),
      })),
    };
  }

  /**
   * Moves an item to a new position within a normal playlist.
   * @param userId The authenticated user ID
   * @param playlistId The ID of the playlist
   * @param playlistItemId The ID of the item to move
   * @param offset The zero-based position the item will have after the move
   * @throws If the playlist or item is not found, or the playlist is a smart playlist
   */
  async moveItem(userId: number, playlistId: number, playlistItemId: number, offset: number) {
    return this.playlistsService.moveItems(userId, playlistId, [playlistItemId], offset);
  }

  /**
   * Removes items from a normal playlist.
   * @param userId The authenticated user ID
   * @param playlistId The ID of the playlist
   * @param playlistItemIds The IDs of the items to remove
   * @throws If the playlist or items are not found
   */
  async removeItems(userId: number, playlistId: number, playlistItemIds: number[]) {
    return this.playlistsService.removeItems(userId, playlistId, playlistItemIds);
  }

  /**
   * Renames a playlist.
   * @param userId The authenticated user ID
   * @param playlistId The ID of the playlist
   * @param name The new name
   * @throws If the playlist is not found
   */
  async updatePlaylist(userId: number, playlistId: number, name: string) {
    return this.playlistsService.updatePlaylist(userId, playlistId, name);
  }

  /**
   * Replaces the rules of a smart playlist.
   * @param userId The authenticated user ID
   * @param playlistId The ID of the playlist
   * @param body The new conjugal and rules
   * @throws If the playlist is not found or is not a smart playlist
   */
  async updateSmartPlaylistRules(userId: number, playlistId: number, body: UpdateSmartPlaylistRulesBodyDto) {
    return this.playlistsService.updatePlaylistRules(userId, playlistId, body.rulesConjugal, body.rules);
  }
}
