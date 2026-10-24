import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGenresService } from './get-genres.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicGenresController {
  constructor(private readonly service: SubsonicGenresService) {}

  @Get(['getGenres', 'getGenres.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getGenres(
    @User() user: AccountEntity,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const genres = await this.service.getGenres(user.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      genres,
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
