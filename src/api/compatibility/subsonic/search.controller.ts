import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicSearchQueryDto, SubsonicSearchResponseDto } from './dtos';
import { SubsonicSearchService } from './search.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicSearchController {
  constructor(private readonly service: SubsonicSearchService) {}

  @SubsonicApiEndpoint(Get, 'search', HttpStatus.OK, {
    summary: 'Search',
    description: 'Search for artists, albums, and songs.',
    responses: {
      [HttpStatus.OK]: SubsonicSearchResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async search(
    @User() user: AccountEntity,
    @Query() query: SubsonicSearchQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const searchResult = await this.service.search(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      searchResult,
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
