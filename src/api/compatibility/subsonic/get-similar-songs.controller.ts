import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicSimilarSongsQueryDto, SubsonicSimilarSongsResponseDto } from './dtos';
import { SubsonicSimilarSongsService } from './get-similar-songs.service';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicSimilarSongsController {
  constructor(private readonly service: SubsonicSimilarSongsService) {}

  @SubsonicApiEndpoint(Get, 'getSimilarSongs', HttpStatus.OK, {
    summary: 'Get Similar Songs',
    description: 'Retrieve songs similar to the specified song.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicSimilarSongsResponseDto),
    },
  })
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
    return formatResponse({ similarSongs: { song: songs } }, jsonResponse, res);
  }
}
