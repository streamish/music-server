import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicTopSongsQueryDto, SubsonicTopSongsResponseDto } from './dtos';
import { SubsonicTopSongsService } from './get-top-songs.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicTopSongsController {
  constructor(private readonly service: SubsonicTopSongsService) {}

  @SubsonicApiEndpoint(Get, 'getTopSongs', HttpStatus.OK, {
    summary: 'Get Top Songs',
    description: 'Retrieve the top songs for an artist.',
    responses: {
      [HttpStatus.OK]: SubsonicTopSongsResponseDto,
    },
  })
  async getTopSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicTopSongsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const songs = await this.service.getTopSongs(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      topSongs: {
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
