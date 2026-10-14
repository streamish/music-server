import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ShoutcastGenreDto, ShoutcastStationDto } from './dtos';
import { ShoutcastGenreEntity, ShoutcastStationEntity } from 'src/database/entities';
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

  async createStation(accountId: number, url: string, title: string) {
    const newItem = await this.shoutcastStationEntity.create({
      accountId,
      title,
      type: ShoutcastItemTypeEnum.STATION,
      url,
    } as ShoutcastStationEntity);
    return stationToRow(newItem);
  }

  async deleteStation(accountId: number, itemId: number) {
    const item = await this.retrieveStation(accountId, itemId);
    await this.shoutcastStationEntity.destroy({
      where: {
        id: item.id,
      },
    });
  }

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

  async listStations(accountId: number, offset: number, limit: number): Promise<ListResult<ShoutcastStationDto>> {
    const data = await this.shoutcastStationEntity.findAndCountAll({
      where: {
        accountId,
      },
      offset: offset || 0,
      limit: limit || 100_000,
    });
    return {
      items: data.rows.map((item) => stationToRow(item)),
      total: data.count,
    };
  }

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
