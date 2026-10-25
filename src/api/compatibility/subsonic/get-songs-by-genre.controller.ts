import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicSongsByGenreQueryDto, SubsonicSongsByGenreResponseDto } from './dtos';
import { SubsonicSongsByGenreService } from './get-songs-by-genre.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicSongsByGenreController {
  constructor(private readonly service: SubsonicSongsByGenreService) {}

  @SubsonicApiEndpoint(Get, 'getSongsByGenre', HttpStatus.OK, {
    summary: 'Get Songs by Genre',
    description: 'Retrieve songs matching a genre.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicSongsByGenreResponseDto),
    },
  })
  async getSongsByGenre(
    @User() user: AccountEntity,
    @Query() query: SubsonicSongsByGenreQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const songs = await this.service.getSongsByGenre(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      songsByGenre: {
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
