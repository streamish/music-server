import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAlbumList2QueryDto, SubsonicAlbumListQueryDto } from './dtos';
import { SubsonicAlbumListService } from './get-album-list.service';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicAlbumListController {
  constructor(private readonly getAlbumListService: SubsonicAlbumListService) {}

  @Get(['getAlbumList', 'getAlbumList.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getAlbumList(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumListQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const album = await this.getAlbumListService.getAlbumList(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumList: {
        album,
      },
    };
    if (jsonResponse) {
      res.setHeader('Content-Type', 'application/json');
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    res.setHeader('Content-Type', 'application/xml');
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }

  @Get(['getAlbumList2', 'getAlbumList2.view'])
  async getAlbumList2(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumList2QueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const album = await this.getAlbumListService.getAlbumList2(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumList2: {
        album,
      },
    };
    if (jsonResponse) {
      res.setHeader('Content-Type', 'application/json');
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    res.setHeader('Content-Type', 'application/xml');
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }
}
