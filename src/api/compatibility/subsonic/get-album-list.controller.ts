import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import {
  SubsonicAlbumList2QueryDto,
  SubsonicAlbumList2ResponseDto,
  SubsonicAlbumListQueryDto,
  SubsonicAlbumListResponseDto,
} from './dtos';
import { SubsonicAlbumListService } from './get-album-list.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicAlbumListController {
  constructor(private readonly getAlbumListService: SubsonicAlbumListService) {}

  @SubsonicApiEndpoint(Get, 'getAlbumList', HttpStatus.OK, {
    summary: 'Get Album List',
    description: 'Retrieve an album list using the legacy response format.',
    responses: {
      [HttpStatus.OK]: SubsonicAlbumListResponseDto,
    },
  })
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

  @SubsonicApiEndpoint(Get, 'getAlbumList2', HttpStatus.OK, {
    summary: 'Get Album List 2',
    description: 'Retrieve an album list.',
    responses: {
      [HttpStatus.OK]: SubsonicAlbumList2ResponseDto,
    },
  })
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
