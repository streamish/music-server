import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicSimilarSongsQueryDto } from './dtos';
import { SubsonicSimilarSongsService } from './get-similar-songs.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicSimilarSongsController {
  constructor(private readonly service: SubsonicSimilarSongsService) {}

  @Get(['getSimilarSongs', 'getSimilarSongs.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getSimilarSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicSimilarSongsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const songs = await this.service.getSimilarSongs(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      similarSongs: {
        song: songs,
      },
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
