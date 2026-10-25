import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicIndexesQueryDto, SubsonicIndexesResponseDto } from './dtos';
import { SubsonicIndexesService } from './get-indexes.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicIndexesController {
  constructor(private readonly getIndexesService: SubsonicIndexesService) {}

  @SubsonicApiEndpoint(Get, 'getIndexes', HttpStatus.OK, {
    summary: 'Get Indexes',
    description: 'Retrieve an indexed list of artists and albums.',
    responses: {
      [HttpStatus.OK]: SubsonicIndexesResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getIndexes(
    @User() user: AccountEntity,
    @Query() query: SubsonicIndexesQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const indexes = await this.getIndexesService.getIndexes(user.id, query.musicFolderId);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      indexes,
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
