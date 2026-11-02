import {
  AlbumEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  TrackEntity,
} from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { PlaylistCoverColors, PlaylistDto, PlaylistItemInputDto, PlaylistRuleDto, PlaylistRuleInputDto } from './dtos';
import {
  PlaylistTypeEnum,
  SmartPlaylistConjugalEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';
import { getDateAddedFilter } from 'src/api/playlists/smart-playlist-rules';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(PlaylistEntity)
    private readonly playlistEntity: typeof PlaylistEntity,
    @InjectModel(PlaylistItemEntity)
    private readonly playlistItemEntity: typeof PlaylistItemEntity,
    @InjectModel(PlaylistSmartRuleEntity)
    private readonly playlistSmartRuleEntity: typeof PlaylistSmartRuleEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
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
  async addItems(
    accountId: number,
    playlistId: number,
    items: PlaylistItemInputDto[],
    offset?: number,
  ): Promise<number[]> {
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
    rules?: PlaylistRuleInputDto[],
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
  async getPlaylist(accountId: number, playlistId: number): Promise<PlaylistDto> {
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
    const rules = await this.getSmartPlaylistRules(playlist.id);
    return {
      id: playlist.id,
      name: playlist.name,
      rulesConjugal: playlist.rulesConjugal,
      type: playlist.type,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      rules,
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
   * Lists the items of a "normal" playlist in position order.
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
      playlists: playlists.rows.map((playlist) => {
        const playlistRules = rules
          .filter((rule) => rule.playlistId === playlist.id)
          .map(
            (rule) =>
              ({
                id: rule.id,
                field: rule.field,
                operation: rule.operation,
                value: rule.value,
                interval: rule.interval || null,
              }) satisfies PlaylistRuleDto,
          );
        return {
          id: playlist.id,
          name: playlist.name,
          type: playlist.type,
          createdAt: playlist.createdAt,
          updatedAt: playlist.updatedAt,
          ...(playlist.type === PlaylistTypeEnum.SMART && {
            rulesConjugal: playlist.rulesConjugal,
            rules: playlistRules,
          }),
        } satisfies PlaylistDto;
      }),
      total: playlists.count,
    };
  }

  /**
   * Finds the first cover-bearing album for the ordered track IDs and returns its palette.
   * @param accountId The account ID
   * @param playlistId The ID of the playlist
   * @returns The palette of the first cover-bearing album found, or an empty object if none are found
   */
  async getCoverColors(accountId: number, playlistId: number): Promise<Partial<PlaylistCoverColors>> {
    const playlist = await this.playlistEntity.findOne({
      attributes: ['id', 'type'],
      where: {
        accountId,
        id: playlistId,
      },
    });
    if (!playlist) {
      throw new NotFoundException(ErrorCodes.PLAYLIST_NOT_FOUND_ERROR);
    }
    // normal playlists
    if (playlist.type === PlaylistTypeEnum.NORMAL) {
      const firstTrackWithAlbum = await this.playlistItemEntity.findOne({
        attributes: ['id', 'playlistId', 'trackId', 'position'],
        where: {
          playlistId: playlist.id,
        },
        include: [
          {
            model: this.trackEntity,
            attributes: ['id'],
            required: true,
            include: [
              {
                attributes: [
                  'id',
                  'coverImage',
                  'coverImageMimeType',
                  'coverImageDarkMuted',
                  'coverImageDarkVibrant',
                  'coverImageLightMuted',
                  'coverImageLightVibrant',
                  'coverImageMuted',
                  'coverImageVibrant',
                ],
                model: AlbumEntity,
                required: true,
                where: {
                  accountId,
                  coverImage: { [Op.not]: null },
                  coverImageMimeType: { [Op.not]: null },
                },
              },
            ],
          },
        ],
        order: [['position', 'ASC']],
      });
      if (firstTrackWithAlbum) {
        const album = firstTrackWithAlbum.track?.album;
        if (album) {
          return {
            coverImageDarkMuted: album.coverImageDarkMuted,
            coverImageDarkVibrant: album.coverImageDarkVibrant,
            coverImageLightMuted: album.coverImageLightMuted,
            coverImageLightVibrant: album.coverImageLightVibrant,
            coverImageMuted: album.coverImageMuted,
            coverImageVibrant: album.coverImageVibrant,
          };
        }
      }
      return {};
    }
    // smart playlists
    const trackIds = await this.getSmartPlaylistTrackIds(accountId, playlistId);
    if (trackIds.length === 0) {
      return {};
    }
    const firstTrackWithAlbum = await this.trackEntity.findOne({
      where: {
        id: trackIds,
      },
      include: [
        {
          attributes: [
            'id',
            'coverImage',
            'coverImageMimeType',
            'coverImageDarkMuted',
            'coverImageDarkVibrant',
            'coverImageLightMuted',
            'coverImageLightVibrant',
            'coverImageMuted',
            'coverImageVibrant',
          ],
          model: AlbumEntity,
          required: true,
          where: {
            accountId,
            coverImage: { [Op.not]: null },
            coverImageMimeType: { [Op.not]: null },
          },
        },
      ],
    });
    if (firstTrackWithAlbum?.album) {
      const { album } = firstTrackWithAlbum;
      return {
        coverImageDarkMuted: album.coverImageDarkMuted,
        coverImageDarkVibrant: album.coverImageDarkVibrant,
        coverImageLightMuted: album.coverImageLightMuted,
        coverImageLightVibrant: album.coverImageLightVibrant,
        coverImageMuted: album.coverImageMuted,
        coverImageVibrant: album.coverImageVibrant,
      };
    }
    return {};
  }

  async getSmartPlaylistRules(playlistId: number): Promise<PlaylistRuleDto[]> {
    const rules = await this.playlistSmartRuleEntity.findAll({
      where: {
        playlistId,
      },
      order: [['id', 'ASC']],
    });
    return rules.map((rule) => {
      return {
        id: rule.id,
        field: rule.field,
        operation: rule.operation,
        value: rule.value,
        interval: rule.interval || null,
      } satisfies PlaylistRuleDto;
    });
  }

  /**
   * Converts a smart playlist rule into a where clause for the tracks table.  Negative operations match only if no
   * value of the field matches the positive form of the operation, as fields like artists can have multiple values.
   * @param rule The smart playlist rule
   * @returns A where clause that matches nothing if the rule is invalid
   */
  private createSmartRuleClause(rule: PlaylistRuleDto): WhereOptions {
    const noMatch = Sequelize.literal('1 = 0');
    const escape = (text: string) => this.trackEntity.sequelize?.escape(text) ?? `'${text.replace(/'/g, `''`)}'`;
    const { field, operation, value } = rule;
    if (field === SmartPlaylistFieldEnum.DATE_ADDED) {
      const filter = getDateAddedFilter(rule);
      if (!filter) {
        return noMatch;
      }
      return {
        createdAt: {
          [Op.gte]: filter.addedAfter ?? new Date(0),
          [Op.lte]: filter.addedBefore ?? new Date(8.64e15),
        },
      };
    }
    const numericColumns: Partial<Record<SmartPlaylistFieldEnum, string>> = {
      [SmartPlaylistFieldEnum.BIT_RATE]: '`TrackEntity`.`bit_rate`',
      [SmartPlaylistFieldEnum.RATING]: 'COALESCE(`TrackEntity`.`rating`, 0)',
      [SmartPlaylistFieldEnum.YEAR]: '`TrackEntity`.`year`',
    };
    const numericColumn = numericColumns[field];
    if (numericColumn) {
      const numericValue = Number(value);
      const operators: Partial<Record<SmartPlaylistOperationEnum, string>> = {
        [SmartPlaylistOperationEnum.IS]: '=',
        [SmartPlaylistOperationEnum.IS_NOT]: '<>',
        [SmartPlaylistOperationEnum.LESS_THAN]: '<',
        [SmartPlaylistOperationEnum.GREATER_THAN_OR_EQUAL_TO]: '>=',
      };
      const operator = operators[operation];
      if (!operator || value.trim() === '' || !Number.isFinite(numericValue)) {
        return noMatch;
      }
      return Sequelize.literal(`${numericColumn} ${operator} ${numericValue}`);
    }
    const negated =
      operation === SmartPlaylistOperationEnum.IS_NOT || operation === SmartPlaylistOperationEnum.DOES_NOT_CONTAIN;
    const matchesText = (expression: string) => {
      switch (operation) {
        case SmartPlaylistOperationEnum.IS:
        case SmartPlaylistOperationEnum.IS_NOT:
          return `LOWER(${expression}) = LOWER(${escape(value)})`;
        case SmartPlaylistOperationEnum.CONTAINS:
        case SmartPlaylistOperationEnum.DOES_NOT_CONTAIN:
          return `LOWER(${expression}) LIKE LOWER(${escape(`%${value}%`)})`;
        default:
          return undefined;
      }
    };
    const associations: Partial<Record<SmartPlaylistFieldEnum, { flag: string; owner: string }>> = {
      [SmartPlaylistFieldEnum.ALBUM_ARTIST]: { flag: 'is_artist', owner: '`al`.`album_id` = `TrackEntity`.`album_id`' },
      [SmartPlaylistFieldEnum.ARTIST]: { flag: 'is_artist', owner: '`al`.`track_id` = `TrackEntity`.`id`' },
      [SmartPlaylistFieldEnum.COMPOSER]: { flag: 'is_composer', owner: '`al`.`track_id` = `TrackEntity`.`id`' },
      [SmartPlaylistFieldEnum.GENRE]: { flag: 'is_genre', owner: '`al`.`track_id` = `TrackEntity`.`id`' },
    };
    const association = associations[field];
    let positive: string | undefined;
    if (association) {
      const nameMatch = matchesText('`a`.`name`');
      positive =
        nameMatch &&
        `EXISTS (SELECT 1 FROM \`association_links\` AS \`al\` INNER JOIN \`associations\` AS \`a\` ` +
          `ON \`a\`.\`id\` = \`al\`.\`association_id\` WHERE ${association.owner} ` +
          `AND \`al\`.\`${association.flag}\` = true AND ${nameMatch})`;
    } else if (field === SmartPlaylistFieldEnum.ALBUM) {
      const titleMatch = matchesText('`al`.`title`');
      positive =
        titleMatch &&
        `EXISTS (SELECT 1 FROM \`albums\` AS \`al\` WHERE \`al\`.\`id\` = \`TrackEntity\`.\`album_id\` ` +
          `AND ${titleMatch})`;
    } else if (field === SmartPlaylistFieldEnum.FILE_PATH) {
      positive = matchesText('`TrackEntity`.`file_path`');
    }
    if (!positive) {
      return noMatch;
    }
    return Sequelize.literal(negated ? `NOT (${positive})` : positive);
  }

  /**
   * Queries the tracks for a smart playlist based on its rules
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the smart playlist to query
   * @param limit The maximum number of track IDs to return
   * @param offset The number of track IDs to skip before starting to collect the result set
   * @returns An array of track IDs that match the smart playlist rules
   */
  async getSmartPlaylistTrackIds(
    accountId: number,
    playlistId: number,
    limit?: number,
    offset?: number,
  ): Promise<number[]> {
    const where = await this.createSmartPlaylistWhere(accountId, playlistId);
    const tracks = await this.trackEntity.findAll({
      attributes: ['id'],
      where,
      limit: limit || 100_000,
      offset: offset || 0,
    });
    return tracks.map((track) => track.id);
  }

  /**
   * Counts the tracks for a smart playlist based on its rules
   * @param accountId The playlist owner account ID
   * @param playlistId The ID of the smart playlist to query
   * @returns The number of tracks that match the smart playlist rules
   */
  async countSmartPlaylistTracks(accountId: number, playlistId: number): Promise<number> {
    const where = await this.createSmartPlaylistWhere(accountId, playlistId);
    return this.trackEntity.count({ where });
  }

  private async createSmartPlaylistWhere(accountId: number, playlistId: number): Promise<WhereOptions> {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const rules = await this.getSmartPlaylistRules(playlistId);
    const ruleClauses = rules.map((rule) => this.createSmartRuleClause(rule));
    return {
      accountId,
      ...(playlist.rulesConjugal === SmartPlaylistConjugalEnum.AND
        ? { [Op.and]: ruleClauses }
        : { [Op.or]: ruleClauses }),
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
    rules: PlaylistRuleInputDto[],
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
