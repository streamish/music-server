import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAlbumList2QueryDto, SubsonicAlbumListQueryDto } from './dtos';
import { SubsonicAlbumListService } from './get-album-list.service';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicAlbumListController {
  constructor(private readonly getAlbumListService: SubsonicAlbumListService) {}

  @Get(['getAlbumList', 'getAlbumList.view'])
  async getAlbumList(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumListQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const album = await this.getAlbumListService.getAlbumList(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumList: {
        album,
      },
    };
    if (jsonResponse) {
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }

  @Get(['getAlbumList2', 'getAlbumList2.view'])
  async getAlbumList2(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumList2QueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const album = await this.getAlbumListService.getAlbumList2(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumList2: {
        album,
      },
    };
    if (jsonResponse) {
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }
}
