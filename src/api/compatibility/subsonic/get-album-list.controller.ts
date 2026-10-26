import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import {
  SubsonicAlbumList2QueryDto,
  SubsonicAlbumList2ResponseDto,
  SubsonicAlbumListQueryDto,
  SubsonicAlbumListResponseDto,
} from './dtos';
import { SubsonicAlbumListService } from './get-album-list.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicAlbumListController {
  constructor(private readonly getAlbumListService: SubsonicAlbumListService) {}

  @SubsonicApiEndpoint(Get, 'getAlbumList', HttpStatus.OK, {
    summary: 'Get Album List',
    description: 'Retrieve an album list using the legacy response format.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicAlbumListResponseDto),
    },
  })
  async getAlbumList(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumListQueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const album = await this.getAlbumListService.getAlbumList(user.id, query);
    return formatResponse(
      {
        albumList: {
          album,
        },
      },
      isJsonResponse,
      res,
    );
  }

  @SubsonicApiEndpoint(Get, 'getAlbumList2', HttpStatus.OK, {
    summary: 'Get Album List 2',
    description: 'Retrieve an album list.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicAlbumList2ResponseDto),
    },
  })
  async getAlbumList2(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumList2QueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const album = await this.getAlbumListService.getAlbumList2(user.id, query);
    return formatResponse(
      {
        albumList2: {
          album,
        },
      },
      isJsonResponse,
      res,
    );
  }
}
