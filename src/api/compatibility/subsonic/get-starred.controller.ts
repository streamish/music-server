import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicStarredController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getStarred', 'getStarred.view'])
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
  @Get(['getStarred2', 'getStarred2.view'])
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
