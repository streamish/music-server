import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { PlaylistEntity, PlaylistItemEntity, PlaylistSmartRuleEntity } from 'src/database/entities';
import { PlaylistTypeEnum, SmartPlaylistConjugalEnum } from 'src/types/enums';
import type { Playlist, PlaylistItem, SmartPlaylistRule } from './types';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(PlaylistEntity)
    private readonly playlistEntity: typeof PlaylistEntity,
    @InjectModel(PlaylistItemEntity)
    private readonly playlistItemEntity: typeof PlaylistItemEntity,
    @InjectModel(PlaylistSmartRuleEntity)
    private readonly playlistSmartRuleEntity: typeof PlaylistSmartRuleEntity,
  ) {}

  /**
   * Appends or inserts items into a "normal" playlist.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @param items The tracks and/or radio stations to add
   * @param offset The zero-based index to insert at, or omitted/negative to append to the end
   * @returns The IDs of the created playlist items in order
   * @throws If the playlist is not found or is a smart playlist
   */
  async addItems(accountId: number, playlistId: number, items: PlaylistItem[], offset?: number): Promise<number[]> {
    const playlist = await this.getPlaylist(accountId, playlistId);
    if (playlist.type === PlaylistTypeEnum.SMART) {
      throw new BadRequestException(ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR);
    }
    if (!items.length) {
      return [];
    }
    const count = await this.playlistItemEntity.count({ where: { playlistId: playlist.id } });
    const insertAt = offset === undefined || offset < 0 || offset > count ? count : offset;
    if (insertAt < count) {
      await this.playlistItemEntity.update(
        {
          position: this.playlistItemEntity.sequelize?.literal(`position + ${items.length}`),
        },
        {
          where: {
            playlistId: playlist.id,
            position: {
              [Op.gt]: insertAt,
            },
          },
        },
      );
    }
    const created = await this.playlistItemEntity.bulkCreate(
      items.map(
        (item, i) =>
          ({
            playlistId: playlist.id,
            position: insertAt + i + 1,
            radioStationTitle: item.trackId ? null : item.radioStationTitle,
            radioStationUrl: item.trackId ? null : item.radioStationUrl,
            trackId: item.trackId || null,
          }) as PlaylistItemEntity,
      ),
    );
    return created.map((item) => item.id);
  }

  /**
   * Creates a playlist.
   * @param accountId The playlist owner account ID
   * @param name The name of the playlist
   * @param type The type of the playlist
   * @param rulesConjugal The rules conjugal for smart playlists
   * @param rules The rules for smart playlists
   * @returns The created playlist
   */
  async createPlaylist(
    accountId: number,
    name: string,
    type: PlaylistTypeEnum,
    rulesConjugal?: SmartPlaylistConjugalEnum | null,
    rules?: SmartPlaylistRule[],
  ) {
    const playlist = await this.playlistEntity.create({
      accountId,
      name,
      rulesConjugal: type === PlaylistTypeEnum.SMART ? rulesConjugal : null,
      type,
    } as PlaylistEntity);
    if (type === PlaylistTypeEnum.SMART && rules?.length) {
      await this.playlistSmartRuleEntity.bulkCreate(
        rules.map(
          (rule) =>
            ({
              playlistId: playlist.id,
              field: rule.field,
              operation: rule.operation,
              value: rule.value,
              interval: rule.interval || null,
            }) as PlaylistSmartRuleEntity,
        ),
      );
    }
    return this.getPlaylist(accountId, playlist.id);
  }

  /**
   * Deletes a playlist and its items and rules.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @throws If the playlist is not found
   */
  async deletePlaylist(accountId: number, playlistId: number) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    await this.playlistEntity.destroy({
      where: {
        id: playlist.id,
      },
    });
  }

  /**
   * Finds a playlist owned by the account.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @returns The playlist including its rules for smart playlists
   * @throws If the playlist is not found
   */
  async getPlaylist(accountId: number, playlistId: number): Promise<Playlist> {
    const playlist = await this.playlistEntity.findOne({
      where: {
        accountId,
        id: playlistId,
      },
    });
    if (!playlist) {
      throw new NotFoundException(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    }
    if (playlist.type === PlaylistTypeEnum.NORMAL) {
      return {
        id: playlist.id,
        name: playlist.name,
        type: playlist.type,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      };
    }
    const rules = await this.playlistSmartRuleEntity.findAll({
      where: {
        playlistId: playlist.id,
      },
      order: [['id', 'ASC']],
    });
    return {
      id: playlist.id,
      name: playlist.name,
      rulesConjugal: playlist.rulesConjugal,
      type: playlist.type,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      rules: rules.map((rule) => {
        return {
          id: rule.id,
          playlistId: rule.playlistId,
          field: rule.field,
          operation: rule.operation,
          value: rule.value,
          interval: rule.interval || null,
        };
      }),
    };
  }

  /**
   * Finds a playlist owned by the account by its name.
   * @param accountId The playlist owner account ID
   * @param name The name of the playlist
   * @throws If the playlist is not found
   */
  async getPlaylistByName(accountId: number, name: string) {
    const playlist = await this.playlistEntity.findOne({
      attributes: ['id'],
      where: {
        accountId,
        name,
      },
    });
    if (!playlist) {
      throw new NotFoundException(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    }
    return this.getPlaylist(accountId, playlist.id);
  }

  /**
   * Lists the items of a playlist in position order.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @param offset The starting point for pagination
   * @param limit The maximum number of items to return
   * @throws If the playlist is not found
   */
  async listItems(accountId: number, playlistId: number, offset = 0, limit = 100_000) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const items = await this.playlistItemEntity.findAndCountAll({
      where: {
        playlistId: playlist.id,
      },
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
      offset,
      limit,
    });
    return {
      items: items.rows.map((item) => item.toJSON()),
      total: items.count,
    };
  }

  /**
   * Lists the account's playlists ordered by name, including the rules of smart playlists.
   * @param accountId The playlist owner account ID
   * @param offset The starting point for pagination
   * @param limit The maximum number of playlists to return
   */
  async listPlaylists(accountId: number, offset = 0, limit = 100_000) {
    const playlists = await this.playlistEntity.findAndCountAll({
      where: {
        accountId,
      },
      order: [
        ['name', 'ASC'],
        ['id', 'ASC'],
      ],
      offset,
      limit,
    });
    const rules = await this.playlistSmartRuleEntity.findAll({
      where: {
        playlistId: playlists.rows.map((p) => p.id),
      },
      order: [['id', 'ASC']],
    });
    return {
      playlists: playlists.rows.map((playlist) => ({
        ...playlist.toJSON(),
        rules: rules.filter((rule) => rule.playlistId === playlist.id).map((rule) => rule.toJSON()),
      })),
      total: playlists.count,
    };
  }

  /**
   * Moves items within a playlist, preserving their relative order.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @param playlistItemIds The IDs of the playlist items to move
   * @param offset The zero-based index among the remaining items to move them to
   * @throws If the playlist or any of the items are not found, or it is a smart playlist
   */
  async moveItems(accountId: number, playlistId: number, playlistItemIds: number[], offset: number) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    if (playlist.type === PlaylistTypeEnum.SMART) {
      throw new BadRequestException(ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR);
    }
    const items = await this.playlistItemEntity.findAll({
      attributes: ['id', 'position'],
      where: {
        playlistId: playlist.id,
      },
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    const movingItems = items.filter((item) => playlistItemIds.includes(item.id));
    if (movingItems.length !== playlistItemIds.length) {
      throw new NotFoundException(ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR);
    }
    const remainingItems = items.filter((item) => !playlistItemIds.includes(item.id));
    const insertAt = Math.min(Math.max(offset, 0), remainingItems.length);
    const newOrder = [...remainingItems.slice(0, insertAt), ...movingItems, ...remainingItems.slice(insertAt)];
    for (let i = 0; i < newOrder.length; i += 1) {
      const item = newOrder[i];
      if (item && item.position !== i + 1) {
        // eslint-disable-next-line no-await-in-loop
        await this.playlistItemEntity.update(
          {
            position: i + 1,
          },
          {
            where: {
              id: item.id,
              playlistId: playlist.id,
            },
          },
        );
      }
    }
  }

  /**
   * Removes a range of items from a playlist and closes the gap in positions.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @param playlistItemIds The IDs of the items to remove
   * @throws If the playlist is not found or there are no items in the range
   */
  async removeItems(accountId: number, playlistId: number, playlistItemIds: number[]) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const items = await this.playlistItemEntity.findAll({
      attributes: ['id'],
      where: {
        playlistId: playlist.id,
      },
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    const deleteItems = items.filter((item) => playlistItemIds.includes(item.id));
    if (!deleteItems.length) {
      throw new NotFoundException(ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR);
    }
    await this.playlistItemEntity.destroy({
      where: {
        id: {
          [Op.in]: deleteItems.map((item) => item.id),
        },
      },
    });
    const remaining = items.filter((item) => !playlistItemIds.includes(item.id));
    for (let i = 0; i < remaining.length; i += 1) {
      const item = remaining[i];
      if (item) {
        // eslint-disable-next-line no-await-in-loop
        await this.playlistItemEntity.update(
          {
            position: i + 1,
          },
          {
            where: {
              id: item.id,
            },
          },
        );
      }
    }
  }

  /**
   * Updates the name of a playlist.
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the playlist
   * @param newName The new name for the playlist
   * @throws If the playlist is not found
   */
  async updatePlaylist(accountId: number, playlistId: number, newName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    await this.playlistEntity.update({ name: newName } as PlaylistEntity, { where: { id: playlist.id } });
  }

  async updatePlaylistRules(
    accountId: number,
    playlistId: number,
    rulesConjugal: SmartPlaylistConjugalEnum | null,
    rules: SmartPlaylistRule[],
  ) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    if (playlist.type !== PlaylistTypeEnum.SMART) {
      throw new BadRequestException(ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR);
    }
    if (playlist.rulesConjugal !== rulesConjugal) {
      await this.playlistEntity.update({ rulesConjugal }, { where: { id: playlist.id } });
    }
    await this.playlistSmartRuleEntity.destroy({
      where: {
        playlistId: playlist.id,
      },
    });
    await this.playlistSmartRuleEntity.bulkCreate(
      rules.map(
        (rule) =>
          ({
            playlistId: playlist.id,
            field: rule.field,
            operation: rule.operation,
            value: rule.value,
            interval: rule.interval || null,
          }) as PlaylistSmartRuleEntity,
      ),
    );
  }
}
