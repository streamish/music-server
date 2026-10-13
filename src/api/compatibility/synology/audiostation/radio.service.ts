/* eslint-disable max-len */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ShoutcastContainerDto, ShoutcastGenreDto, ShoutcastStationDto } from 'src/shoutcast/dtos';
import { ShoutcastItemTypeEnum } from 'src/types/enums';
import { ShoutcastService } from 'src/shoutcast/shoutcast.service';
import {
  SynologyRadioAddOrUpdateItemBodyDto,
  SynologyRadioItemDataDto,
  SynologyRadioItemDto,
  SynologyRadioItemListBodyDto,
} from './dtos';

function containerToRow(container: ShoutcastContainerDto): SynologyRadioItemDto {
  return {
    desc: '',
    id: container.id.toString(),
    title: container.title,
    type: ShoutcastItemTypeEnum.CONTAINER,
    url: '',
  };
}

function genreToRow(item: ShoutcastGenreDto): SynologyRadioItemDto {
  return {
    desc: '',
    id: `SHOUTcast_genre_${item.name}`,
    title: item.name,
    type: ShoutcastItemTypeEnum.CONTAINER,
    url: '',
  };
}

function stationToRow(item: ShoutcastStationDto): SynologyRadioItemDto {
  return {
    desc: item.description || '',
    // TODO: Investigate if this `id` value is a mistake for hardcoding genre but it may be disregarded
    id: `SHOUTcast_genre_${item.title}`,
    title: item.title,
    type: item.type,
    url: item.url || '',
  };
}

@Injectable()
export class SynologyRadioService {
  constructor(private readonly shoutcastService: ShoutcastService) {}

  async listContainers(accountId: number) {
    const containers = await this.shoutcastService.listContainers(accountId);
    return {
      radios: containers.items.map(containerToRow),
      offset: 0,
      total: containers.total,
    };
  }

  async listItems(accountId: number, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemDataDto> {
    const containers = await this.shoutcastService.listContainers(accountId);
    const container = containers.items.find((c) => {
      return (
        c.id.toString() === body.container || c.title === body.container || c.title === body.container.split('_')[0]
      );
    });
    if (!container) {
      throw new Error(`Container not found for account ${accountId} and title ${body.container}`);
    }
    if (container.title === 'SHOUTcast') {
      const genres = await this.shoutcastService.listGenres(accountId);
      return {
        radios: genres.items.map((genre) => genreToRow(genre)),
        offset: 0,
        total: genres.total,
      };
    }
    const stations = await this.shoutcastService.listStations(accountId, container.id);
    return {
      radios: stations.items.map((item) => stationToRow(item)),
      offset: 0,
      total: stations.total,
    };
  }

  async listStations(accountId: number, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemDataDto> {
    const genreName = body.container.split('_genre_')[1];
    if (!genreName) {
      throw new Error(`Invalid genre name in container field: ${body.container}`);
    }
    const containers = await this.shoutcastService.listContainers(accountId);
    const container = containers.items.find((c) => c.title === body.container.split('_')[0]);
    if (!container) {
      throw new Error(`Container not found for account ${accountId} and title ${body.container}`);
    }
    // return SHOUTcast stations for the given genre
    if (container.title === 'SHOUTcast') {
      const postBody = `genrename=${genreName}`;
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
        radios: response.map((station) => {
          return {
            id: `radio_${station.Name} http://yp.shoutcast.com/sbin/tunein-station.pls?id=${station.ID}`,
            title: station.Name,
            type: ShoutcastItemTypeEnum.STATION,
            url: `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${station.ID}`,
          };
        }),
        offset: 0,
        total: response.length,
      };
    }
    // return favorites or user-defined stations for the given container
    const stations = await this.shoutcastService.listStations(accountId, container.id);
    return {
      radios: stations.items.map((item) => stationToRow(item)),
      offset: 0,
      total: stations.total,
    };
  }

  async addOrUpdateItem(accountId: number, body: SynologyRadioAddOrUpdateItemBodyDto) {
    const data = body.radios_json[0];
    if (!data?.title || !data?.url) {
      throw new BadRequestException(`Missing required fields for adding a new item: title and url are required`);
    }
    const containers = await this.shoutcastService.listContainers(accountId);
    const container = containers.items.find(
      (c) => c.title === body.container || c.title === body.container.split('_')[0],
    );
    if (!container) {
      throw new NotFoundException(`Container not found for account ${accountId} and title ${body.container}`);
    }
    // add item
    if (body.offset === -1) {
      await this.shoutcastService.createStation(accountId, container.id, data.url, data.title, data.desc);
      return;
    }
    // update item
    const stations = await this.shoutcastService.listStations(accountId, container.id);
    const itemToUpdate = stations.items[body.offset];
    if (!itemToUpdate) {
      throw new NotFoundException(`Item not found for account ${accountId} at offset ${body.offset}`);
    }
    await this.shoutcastService.updateStation(accountId, itemToUpdate.id, data.url, data.title, data.desc);
  }

  async deleteItem(accountId: number, body: SynologyRadioAddOrUpdateItemBodyDto): Promise<SynologyRadioItemDataDto> {
    const containers = await this.shoutcastService.listContainers(accountId);
    const container = containers.items.find(
      (c) => c.title === body.container || c.title === body.container.split('_')[0],
    );
    if (!container) {
      throw new NotFoundException(`Container not found for account ${accountId} and title ${body.container}`);
    }
    const stations = await this.shoutcastService.listStations(accountId, container.id);
    const itemToDelete = stations.items[body.offset];
    if (!itemToDelete) {
      throw new NotFoundException(`Item not found for account ${accountId} at offset ${body.offset}`);
    }
    await this.shoutcastService.deleteStation(accountId, itemToDelete.id);
    return this.listItems(accountId, {
      ...body,
      offset: 0,
    });
  }
}
