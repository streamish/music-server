import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicStarredResponseDto } from './dtos';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicStarredController {
  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getStarred', HttpStatus.OK, {
    summary: 'Get Starred',
    description: 'Retrieve the starred songs, albums, and artists using the legacy response format.',
    responses: {
      [HttpStatus.OK]: SubsonicStarredResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getStarred(
    @User() user: AccountEntity,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      starred: {},
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

  // eslint-disable-next-line class-methods-use-this
  @SubsonicApiEndpoint(Get, 'getStarred2', HttpStatus.OK, {
    summary: 'Get Starred 2',
    description: 'Retrieve the starred songs, albums, and artists.',
    responses: {
      [HttpStatus.OK]: SubsonicStarredResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getStarred2(
    @User() user: AccountEntity,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      starred: {},
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
