import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ShoutcastContainerEntity, ShoutcastItemEntity } from 'src/database/entities';
import { ShoutcastItemTypeEnum } from 'src/types/enums';
import {
  SynologyRadioAddOrUpdateItemBodyDto,
  SynologyRadioItemDataDto,
  SynologyRadioItemDto,
  SynologyRadioItemListBodyDto,
} from './dtos';

function containerToRow(container: ShoutcastContainerEntity): SynologyRadioItemDto {
  return {
    desc: '',
    id: container.id.toString(),
    title: container.title,
    type: ShoutcastItemTypeEnum.CONTAINER,
    url: '',
  };
}

function itemToRow(item: ShoutcastItemEntity): SynologyRadioItemDto {
  return {
    desc: item.desc || '',
    id: `SHOUTcast_genre_${item.title}`,
    title: item.title,
    type: item.type,
    url: item.url || '',
  };
}

@Injectable()
export class SynologyRadioService {
  constructor(
    @InjectModel(ShoutcastContainerEntity)
    private readonly shoutcastContainerEntity: typeof ShoutcastContainerEntity,
    @InjectModel(ShoutcastItemEntity)
    private readonly shoutcastItemEntity: typeof ShoutcastItemEntity,
  ) {}

  async listContainers(accountId: number) {
    const containers = await this.shoutcastContainerEntity.findAll({
      where: {
        accountId,
      },
    });
    return {
      radios: containers.map(containerToRow),
      offset: 0,
      total: containers.length,
    };
  }

  async listItems(accountId: number, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemDataDto> {
    const container = await this.shoutcastContainerEntity.findOne({
      where: {
        accountId,
        [Op.or]: [{ id: body.container }, { title: body.container }, { title: body.container.split('_')[0] }],
      },
    });
    if (!container) {
      throw new Error(`Container not found for account ${accountId} and title ${body.container}`);
    }
    const items = await this.shoutcastItemEntity.findAll({
      where: {
        containerId: container.id,
      },
    });
    return {
      radios: items.map((item) => itemToRow(item)),
      offset: 0,
      total: items.length,
    };
  }

  async listStations(accountId: number, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemDataDto> {
    const genreName = body.container.split('_genre_')[1];
    if (!genreName) {
      throw new Error(`Invalid genre name in container field: ${body.container}`);
    }
    const container = await this.shoutcastContainerEntity.findOne({
      where: {
        accountId,
        title: body.container.split('_')[0],
      },
    });
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
    const items = await this.shoutcastItemEntity.findAll({
      where: {
        containerId: container.id,
      },
    });
    return {
      radios: items.map((item) => itemToRow(item)),
      offset: 0,
      total: items.length,
    };
  }

  async addOrUpdateItem(accountId: number, body: SynologyRadioAddOrUpdateItemBodyDto): Promise<void> {
    const data = body.radios_json[0];
    if (!data?.title || !data?.url) {
      throw new BadRequestException(`Missing required fields for adding a new item: title and url are required`);
    }
    const container = await this.shoutcastContainerEntity.findOne({
      where: {
        accountId,
        title: body.container,
      },
    });
    if (!container) {
      throw new NotFoundException(`Container not found for account ${accountId} and title ${body.container}`);
    }
    // add item
    if (body.offset === -1) {
      await this.shoutcastItemEntity.create({
        containerId: container.id,
        desc: data.desc,
        title: data.title,
        type: ShoutcastItemTypeEnum.STATION,
        url: data.url,
      } as ShoutcastItemEntity);
      return;
    }
    // update item
    const items = await this.shoutcastItemEntity.findAll({
      where: {
        containerId: container.id,
      },
      offset: body.offset,
      limit: 1,
    });
    const itemToUpdate = items[0];
    if (!itemToUpdate) {
      throw new NotFoundException(`Item not found for account ${accountId} at offset ${body.offset}`);
    }
    await this.shoutcastItemEntity.update(
      {
        title: data.title,
        url: data.url,
        desc: data.desc,
      },
      {
        where: {
          id: itemToUpdate.id,
        },
      },
    );
  }

  async deleteItem(accountId: number, body: SynologyRadioAddOrUpdateItemBodyDto): Promise<SynologyRadioItemDataDto> {
    const container = await this.shoutcastContainerEntity.findOne({
      where: {
        accountId,
        title: body.container,
      },
    });
    if (!container) {
      throw new NotFoundException(`Container not found for account ${accountId} and title ${body.container}`);
    }
    const items = await this.shoutcastItemEntity.findAll({
      where: {
        containerId: container.id,
      },
      offset: body.offset,
      limit: 1,
    });
    const itemToDelete = items[0];
    if (!itemToDelete) {
      throw new NotFoundException(`Item not found for account ${accountId} at offset ${body.offset}`);
    }
    await this.shoutcastItemEntity.destroy({
      where: {
        id: itemToDelete.id,
      },
    });
    return this.listItems(accountId, {
      ...body,
      offset: 0,
    });
  }
}
