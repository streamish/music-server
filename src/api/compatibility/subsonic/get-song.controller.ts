import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Query, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { SubsonicSongQueryDto } from './dtos';
import { SubsonicSongService } from './get-song.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseFilters(SubsonicExceptionFilter)
@UseGuards(SubsonicAuthGuard)
export class SubsonicSongController {
  constructor(private readonly service: SubsonicSongService) {}

  @Get(['getSong', 'getSong.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getSong(
    @User() user: AccountEntity,
    @Query() query: SubsonicSongQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const song = await this.service.getSong(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      song,
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
