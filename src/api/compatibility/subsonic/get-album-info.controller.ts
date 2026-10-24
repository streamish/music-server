import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Query, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAlbumInfoQueryDto } from './dtos';
import { SubsonicAlbumInfoService } from './get-album-info.service';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseFilters(SubsonicExceptionFilter)
@UseGuards(SubsonicAuthGuard)
export class SubsonicAlbumInfoController {
  constructor(private readonly albumInfoService: SubsonicAlbumInfoService) {}

  @Get(['getAlbumInfo', 'getAlbumInfo.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getAlbumInfo(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumInfoQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const albumInfo = await this.albumInfoService.getAlbumInfo(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumInfo,
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

  @Get(['getAlbumInfo2', 'getAlbumInfo2.view'])
  async getAlbumInfo2(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumInfoQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);

    await this.albumInfoService.getAlbumInfo2(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumInfo: {},
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
