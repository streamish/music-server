import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicStarredResponseDto } from './dtos';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicStarredController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getStarred', HttpStatus.OK, {
    summary: 'Get Starred',
    description: 'Retrieve the starred songs, albums, and artists using the legacy response format.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicStarredResponseDto),
    },
  })
  async getStarred(
    @User() user: AccountEntity,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    return formatResponse({ starred: {} }, isJsonResponse, res);
  }

  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getStarred2', HttpStatus.OK, {
    summary: 'Get Starred 2',
    description: 'Retrieve the starred songs, albums, and artists.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicStarredResponseDto),
    },
  })
  async getStarred2(
    @User() user: AccountEntity,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    return formatResponse({ starred: {} }, isJsonResponse, res);
  }
}
