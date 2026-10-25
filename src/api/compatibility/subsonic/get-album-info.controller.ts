import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicAlbumInfoQueryDto, SubsonicAlbumInfoResponseDto } from './dtos';
import { SubsonicAlbumInfoService } from './get-album-info.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicAlbumInfoController {
  constructor(private readonly albumInfoService: SubsonicAlbumInfoService) {}

  @SubsonicApiEndpoint(Get, 'getAlbumInfo', HttpStatus.OK, {
    summary: 'Get Album Info',
    description: 'Retrieve information about a specific album.',
    responses: {
      [HttpStatus.OK]: SubsonicAlbumInfoResponseDto,
    },
  })
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

  @SubsonicApiEndpoint(Get, 'getAlbumInfo2', HttpStatus.OK, {
    summary: 'Get Album Info 2',
    description: 'Retrieve information about a specific album (version 2).',
    responses: {
      [HttpStatus.OK]: SubsonicAlbumInfoResponseDto,
    },
  })
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
