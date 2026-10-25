import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicRandomSongsQueryDto, SubsonicRandomSongsResponseDto } from './dtos';
import { SubsonicRandomSongsService } from './get-random-songs.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicRandomSongsController {
  constructor(private readonly service: SubsonicRandomSongsService) {}

  @SubsonicApiEndpoint(Get, 'getRandomSongs', HttpStatus.OK, {
    summary: 'Get Random Songs',
    description: 'Retrieve a random collection of songs.',
    responses: {
      [HttpStatus.OK]: SubsonicRandomSongsResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getRandomSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicRandomSongsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const songs = await this.service.getRandomSongs(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      randomSongs: {
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
