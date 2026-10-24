import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { SubsonicNowPlayingService } from './get-now-playing.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseFilters(SubsonicExceptionFilter)
@UseGuards(SubsonicAuthGuard)
export class SubsonicNowPlayingController {
  constructor(private readonly service: SubsonicNowPlayingService) {}

  @Get(['getNowPlaying', 'getNowPlaying.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getNowPlaying(
    @User() user: AccountEntity,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const nowPlaying = await this.service.getNowPlaying(user.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      nowPlaying,
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
