import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicArtistsQueryDto, SubsonicArtistsResponseDto } from './dtos';
import { SubsonicArtistsService } from './get-artists.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicArtistsController {
  constructor(private readonly getArtistsService: SubsonicArtistsService) {}

  @SubsonicApiEndpoint(Get, 'getArtists', HttpStatus.OK, {
    summary: 'Get Artists',
    description: 'Retrieve an indexed list of artists.',
    responses: {
      [HttpStatus.OK]: SubsonicArtistsResponseDto,
    },
  })
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicArtistsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const artist = await this.getArtistsService.getArtists(user.id, query.musicFolderId);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      artist,
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
