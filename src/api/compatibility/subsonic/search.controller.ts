import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicSearchQueryDto, SubsonicSearchResponseDto } from './dtos';
import { SubsonicSearchService } from './search.service';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicSearchController {
  constructor(private readonly service: SubsonicSearchService) {}

  @SubsonicApiEndpoint(Get, 'search', HttpStatus.OK, {
    summary: 'Search',
    description: 'Search for artists, albums, and songs.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicSearchResponseDto),
    },
  })
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
    return formatResponse(searchResult, jsonResponse, res);
  }
}
