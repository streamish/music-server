import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { FavoriteItemEntity, ShoutcastGenreEntity, ShoutcastStationEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { ShoutcastGenreDto, ShoutcastStationDto } from './dtos';
import { ShoutcastItemTypeEnum } from 'src/types/enums';
import type { ListResult } from 'src/types/list-result';

function genreToRow(container: ShoutcastGenreEntity): ShoutcastGenreDto {
  return {
    id: container.id,
    name: container.name,
  };
}

function stationToRow(item: ShoutcastStationEntity): ShoutcastStationDto {
  return {
    favoriteId: item.favorite?.id,
    id: item.id,
    title: item.title,
    type: item.type,
    url: item.url || '',
  };
}
@Injectable()
export class ShoutcastService {
  constructor(
    @InjectModel(ShoutcastGenreEntity)
    private readonly shoutcastGenreEntity: typeof ShoutcastGenreEntity,
    @InjectModel(ShoutcastStationEntity)
    private readonly shoutcastStationEntity: typeof ShoutcastStationEntity,
  ) {}

  /**
   * Adds a new SHOUTcast genre for a user.  The genre must be a real genre as identified
   * by SHOUTcast themselves, or there will be no music.
   * @param accountId The account to add the genre for
   * @param name The name of the genre to create
   * @returns The created genre object
   */
  async createGenre(accountId: number, name: string) {
    const existingGenre = await this.shoutcastGenreEntity.findOne({
      where: {
        accountId,
        name,
      },
    });
    if (existingGenre) {
      throw new BadRequestException(ErrorCodes.SHOUTCAST_GENRE_ALREADY_EXISTS_ERROR);
    }
    const newItem = await this.shoutcastGenreEntity.create({
      accountId,
      name,
    } as ShoutcastGenreEntity);
    return genreToRow(newItem);
  }

  /**
   * Adds a custom station for a user.  The station requires a title and a URL, and the URL
   * must be valid for the  station to work.
   * @param accountId The account to add the station for
   * @param url The URL of the custom station
   * @param title The title of the custom station
   * @returns The created station object
   */
  async createStation(accountId: number, url: string, title: string) {
    const newItem = await this.shoutcastStationEntity.create({
      accountId,
      title,
      type: ShoutcastItemTypeEnum.STATION,
      url,
    } as ShoutcastStationEntity);
    return stationToRow(newItem);
  }

  /**
   * Deletes a custom SHOUTcast station for a user.  This only deletes their reference to it
   * and has no bearing on the station itself or other users that may have added it.
   * @param accountId The account to delete the station for
   * @param itemId The ID of the station to delete
   */
  async deleteStation(accountId: number, itemId: number) {
    const item = await this.retrieveStation(accountId, itemId);
    await this.shoutcastStationEntity.destroy({
      where: {
        id: item.id,
      },
    });
  }

  /**
   * Deletes a SHOUTcast genre for a user.  The genre can be custom-added or one of the
   * pre-populated genres inserted at account creation.  This only removes their reference
   * to it and has no bearing on the genre itself or other users that may have added it.
   * @param accountId The account to delete the genre for
   * @param genreId The ID of the genre to delete
   */
  async deleteGenre(accountId: number, genreId: number) {
    const genre = await this.retrieveGenre(accountId, genreId);
    await this.shoutcastGenreEntity.destroy({
      where: {
        id: genre.id,
      },
    });
  }

  /**
   * Lists all SHOUTcast genres for a user.  These are a hard-coded non-definitive list of
   * genres inserted into the database during account creation, and any additional genres
   * that user may have added to their account.
   * @param accountId The account to list genres for
   * @returns An object containing the list of genres and the total count
   */
  async listGenres(accountId: number): Promise<ListResult<ShoutcastGenreDto>> {
    const genres = await this.shoutcastGenreEntity.findAndCountAll({
      attributes: ['id', 'name'],
      where: {
        accountId,
      },
    });
    return {
      items: genres.rows.map(genreToRow),
      total: genres.count,
    };
  }

  /**
   * Lists all online SHOUTcast stations for a user filtered by genre.  This list is fetched
   * in real time from the SHOUTcast directory and may vary as stations come online or go
   * offline.  They are not persisted in the database for that reason.
   * @param accountId The account to list online stations for
   * @param genreId The ID of the genre to filter stations by
   * @returns An object containing the list of online stations and the total count
   */
  async listOnlineStations(accountId: number, genreId: number): Promise<ListResult<ShoutcastStationDto>> {
    const genre = await this.retrieveGenre(accountId, genreId);
    const postBody = `genrename=${genre.name}`;
    const request = await fetch(`https://directory.shoutcast.com/Home/BrowseByGenre`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': postBody.length.toString(),
        Referer: 'https://directory.shoutcast.com/',
      },
      body: postBody,
    });
    const response = await request.json();
    return {
      items: response.map((station) => {
        return {
          id: `radio_${station.Name} http://yp.shoutcast.com/sbin/tunein-station.pls?id=${station.ID}`,
          title: station.Name,
          type: ShoutcastItemTypeEnum.STATION,
          url: `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${station.ID}`,
        };
      }),
      total: response.length,
    };
  }

  /**
   * Lists all SHOUTcast stations added by a user.  This list is fetched from the database
   * and may not reflect real-time online status.
   * @param accountId The account to list stations for
   * @param offset The number of stations to skip for pagination
   * @param limit The maximum number of stations to return
   * @returns An object containing the list of stations and the total count
   */
  async listStations(accountId: number, offset: number, limit: number): Promise<ListResult<ShoutcastStationDto>> {
    const data = await this.shoutcastStationEntity.findAndCountAll({
      where: {
        accountId,
      },
      include: [
        {
          model: FavoriteItemEntity,
          required: false,
        },
      ],
      offset: offset || 0,
      limit: limit || 100_000,
    });
    return {
      items: data.rows.map((item) => stationToRow(item)),
      total: data.count,
    };
  }

  /**
   * Retrieves a specific SHOUTcast genre for a user.
   * @param accountId The account to retrieve the genre for
   * @param genreId The ID of the genre to retrieve
   * @throws NotFoundException if the genre is not found
   * @returns The genre object if found
   */
  async retrieveGenre(accountId: number, genreId: number) {
    const genre = await this.shoutcastGenreEntity.findOne({
      where: {
        id: genreId,
        accountId,
      },
    });
    if (!genre) {
      throw new NotFoundException(ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR);
    }
    return genreToRow(genre);
  }

  /**
   * Retrieves a specific SHOUTcast station for a user.
   * @param accountId The account to retrieve the station for
   * @param stationId The ID of the station to retrieve
   * @returns The station object if found
   * @throws NotFoundException if the station is not found
   */
  async retrieveStation(accountId: number, stationId: number) {
    const station = await this.shoutcastStationEntity.findOne({
      where: {
        id: stationId,
        accountId,
      },
    });
    if (!station) {
      throw new NotFoundException(ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR);
    }
    return stationToRow(station);
  }

  /**
   * Updates a specific SHOUTcast genre for a user if the name needs revision.
   * @param accountId The account that owns the genre
   * @param genreId The ID of the genre to update
   * @param newName The new name for the genre
   * @throws NotFoundException if the genre is not found
   */
  async updateGenre(accountId: number, genreId: number, newName: string) {
    const genre = await this.retrieveGenre(accountId, genreId);
    const existingGenre = await this.shoutcastGenreEntity.findOne({
      where: {
        accountId,
        name: newName,
      },
    });
    if (existingGenre) {
      throw new BadRequestException(ErrorCodes.SHOUTCAST_GENRE_ALREADY_EXISTS_ERROR);
    }
    await this.shoutcastGenreEntity.update(
      {
        name: newName,
      },
      {
        where: {
          id: genre.id,
        },
      },
    );
  }

  /**
   * Updates the details of a specific SHOUTcast station for a user.
   * @param accountId The account that owns the station
   * @param stationId The ID of the station to update
   * @param url The new URL for the station
   * @param title The new title for the station
   * @throws NotFoundException if the station is not found
   */
  async updateStation(accountId: number, stationId: number, url: string, title: string) {
    const station = await this.retrieveStation(accountId, stationId);
    await this.shoutcastStationEntity.update(
      {
        title,
        url,
      },
      {
        where: {
          id: station.id,
        },
      },
    );
  }
}
