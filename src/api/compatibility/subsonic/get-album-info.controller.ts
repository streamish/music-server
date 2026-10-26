import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicAlbumInfoQueryDto, SubsonicAlbumInfoResponseDto } from './dtos';
import { SubsonicAlbumInfoService } from './get-album-info.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicAlbumInfoController {
  constructor(private readonly albumInfoService: SubsonicAlbumInfoService) {}

  @SubsonicApiEndpoint(Get, 'getAlbumInfo', HttpStatus.OK, {
    summary: 'Get Album Info',
    description: 'Retrieve information about a specific album.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicAlbumInfoResponseDto),
    },
  })
  async getAlbumInfo(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumInfoQueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const albumInfo = await this.albumInfoService.getAlbumInfo(user.id, query.id);
    return formatResponse(
      {
        albumInfo,
      },
      isJsonResponse,
      res,
    );
  }

  @SubsonicApiEndpoint(Get, 'getAlbumInfo2', HttpStatus.OK, {
    summary: 'Get Album Info 2',
    description: 'Retrieve information about a specific album (version 2).',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicAlbumInfoResponseDto),
    },
  })
  async getAlbumInfo2(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumInfoQueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);

    const albumInfo = await this.albumInfoService.getAlbumInfo2(user.id, query.id);
    return formatResponse(
      {
        albumInfo,
      },
      isJsonResponse,
      res,
    );
  }
}
