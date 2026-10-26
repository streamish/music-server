import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicTopSongsQueryDto, SubsonicTopSongsResponseDto } from './dtos';
import { SubsonicTopSongsService } from './get-top-songs.service';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicTopSongsController {
  constructor(private readonly service: SubsonicTopSongsService) {}

  @SubsonicApiEndpoint(Get, 'getTopSongs', HttpStatus.OK, {
    summary: 'Get Top Songs',
    description: 'Retrieve the top songs for an artist.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicTopSongsResponseDto),
    },
  })
  async getTopSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicTopSongsQueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const songs = await this.service.getTopSongs(user.id, query);
    return formatResponse({ topSongs: { song: songs } }, isJsonResponse, res);
  }
}
