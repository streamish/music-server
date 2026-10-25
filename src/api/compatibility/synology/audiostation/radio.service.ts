import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FavoritesService } from 'src/favorites/favorites.service';
import { ShoutcastContainerNamesEnum, ShoutcastItemTypeEnum } from 'src/types/enums';
import { ShoutcastGenreDto, ShoutcastStationDto } from 'src/shoutcast/dtos';
import { ShoutcastService } from 'src/shoutcast/shoutcast.service';
import {
  SynologyRadioAddOrUpdateItemBodyDto,
  SynologyRadioItemDataDto,
  SynologyRadioItemDto,
  SynologyRadioItemListBodyDto,
} from './dtos';

const containers = [
  ShoutcastContainerNamesEnum.SHOUTCAST,
  ShoutcastContainerNamesEnum.USER_DEFINED,
  ShoutcastContainerNamesEnum.MY_FAVORITE,
];

function containerToRow(container: string): SynologyRadioItemDto {
  return {
    desc: '',
    id: container,
    title: container,
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
    desc: '',
    // TODO: Investigate if this `id` value is a mistake for hardcoding genre but it may be disregarded
    id: `SHOUTcast_genre_${item.title}`,
    title: item.title,
    type: item.type,
    url: item.url || '',
  };
}

@Injectable()
export class SynologyRadioService {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly shoutcastService: ShoutcastService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  async listContainers() {
    return {
      radios: containers.map(containerToRow),
      offset: 0,
      total: containers.length,
    };
  }

  async listItems(accountId: number, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemDataDto> {
    const container = containers.find((c) => {
      return c === body.container || c === body.container.split('_')[0];
    });
    if (!container) {
      throw new Error(`Container not found for account ${accountId} and title ${body.container}`);
    }
    if (container === 'SHOUTcast') {
      const genres = await this.shoutcastService.listGenres(accountId);
      return {
        radios: genres.items.map((genre) => genreToRow(genre)),
        offset: 0,
        total: genres.total,
      };
    }
    const stations = await this.shoutcastService.listStations(accountId, 0, 100_000);
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
    // return SHOUTcast stations for the given genre
    if (body.container.startsWith(ShoutcastContainerNamesEnum.SHOUTCAST)) {
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
      const response: {
        Name: string;
        ID: string;
      }[] = await request.json();
      return {
        radios: response.map((station) => {
          return {
            id: `radio_${station.Name} http://yp.shoutcast.com/sbin/tunein-station.pls?id=${station.ID}`,
            title: station.Name,
            desc: '',
            type: ShoutcastItemTypeEnum.STATION,
            url: `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${station.ID}`,
          };
        }),
        offset: 0,
        total: response.length,
      };
    }
    // return user-defined stations for the given container
    const stations = await this.shoutcastService.listStations(accountId, 0, 100_000);
    return {
      radios: stations.items.map((item) => stationToRow(item)),
      offset: 0,
      total: stations.total,
    };
  }

  /**
   * Adds or updates a bespoke SHOUTcast radio station.  If being added to favorites, a favorite entry will also be
   * created.  An entry is created if the `offset` value is -1 otherwise the value represents the position of the
   * entry to update in the list of stations.
   * @param accountId The authenticated user ID
   * @param body The request body containing the container, offset and radios_json information for the item
   * @returns The newly added or updated SHOUTcast station.
   */
  async addOrUpdateItem(accountId: number, body: SynologyRadioAddOrUpdateItemBodyDto) {
    const data = body.radios_json[0];
    if (!data?.title || !data?.url) {
      throw new BadRequestException(`Missing required fields for adding a new item: title and url are required`);
    }
    const container = containers.find((c) => c === body.container || c === body.container.split('_')[0]);
    if (!container) {
      throw new NotFoundException(`Container not found for account ${accountId} and title ${body.container}`);
    }
    // add item
    if (body.offset === -1) {
      const station = await this.shoutcastService.createStation(accountId, data.url, data.title);
      if (body.container === ShoutcastContainerNamesEnum.MY_FAVORITE) {
        await this.favoritesService.setShoutcastStationFavorite(accountId, station.id);
        return;
      }
      return;
    }
    // update item
    const stations = await this.shoutcastService.listStations(accountId, body.offset, 1);
    const itemToUpdate = stations.items[0];
    if (!itemToUpdate) {
      throw new NotFoundException(`Item not found for account ${accountId} at offset ${body.offset}`);
    }
    await this.shoutcastService.updateStation(accountId, itemToUpdate.id, data.url, data.title);
  }

  /**
   * Deletes a SHOUTcast station that has been added by the user, or added as a favorite.  If the station
   * were added as a favorite then both the favorite entry and the SHOUTcast station will be deleted
   * automatically as part of a cascading delete.
   * @param accountId The authenticated user ID
   * @param body The request body containing the container and offset information for the item to delete.
   * @returns Updated list of SHOUTcast stations
   */
  async deleteItem(accountId: number, body: SynologyRadioAddOrUpdateItemBodyDto): Promise<SynologyRadioItemDataDto> {
    if (
      body.container !== ShoutcastContainerNamesEnum.USER_DEFINED &&
      body.container !== ShoutcastContainerNamesEnum.MY_FAVORITE
    ) {
      throw new NotFoundException(`Container not found for account ${accountId} and title ${body.container}`);
    }
    const stations = await this.shoutcastService.listStations(accountId, body.offset, 1);
    const itemToDelete = stations.items[0];
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
