import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicGenresResponseDto } from './dtos';
import { SubsonicGenresService } from './get-genres.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicGenresController {
  constructor(private readonly service: SubsonicGenresService) {}

  @SubsonicApiEndpoint(Get, 'getGenres', HttpStatus.OK, {
    summary: 'Get Genres',
    description: 'Retrieve the list of music genres.',
    responses: {
      [HttpStatus.OK]: SubsonicGenresResponseDto,
    },
  })
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
