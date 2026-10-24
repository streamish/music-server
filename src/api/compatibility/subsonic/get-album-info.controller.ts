import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAlbumInfoQueryDto } from './dtos';
import { SubsonicAlbumInfoService } from './get-album-info.service';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicAlbumInfoController {
  constructor(private readonly albumInfoService: SubsonicAlbumInfoService) {}

  @Get(['getAlbumInfo', 'getAlbumInfo.view'])
  async getAlbumInfo(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumInfoQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const albumInfo = await this.albumInfoService.getAlbumInfo(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumInfo,
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

  @Get(['getAlbumInfo2', 'getAlbumInfo2.view'])
  async getAlbumInfo2(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumInfoQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    await this.albumInfoService.getAlbumInfo2(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      albumInfo: {},
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
