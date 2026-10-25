import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicAlbumQueryDto, SubsonicAlbumResponseDto } from './dtos';
import { SubsonicAlbumService } from './get-album.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicAlbumController {
  constructor(private readonly getAlbumService: SubsonicAlbumService) {}

  @SubsonicApiEndpoint(Get, 'getAlbum', HttpStatus.OK, {
    summary: 'Get Album',
    description: 'Retrieve an album and its songs.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicAlbumResponseDto),
    },
  })
  async getAlbum(
    @User() user: AccountEntity,
    @Query() query: SubsonicAlbumQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const album = await this.getAlbumService.getAlbum(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      album,
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
