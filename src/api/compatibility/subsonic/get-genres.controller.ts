import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicGenresResponseDto } from './dtos';
import { SubsonicGenresService } from './get-genres.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicGenresController {
  constructor(private readonly service: SubsonicGenresService) {}

  @SubsonicApiEndpoint(Get, 'getGenres', HttpStatus.OK, {
    summary: 'Get Genres',
    description: 'Retrieve the list of music genres.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicGenresResponseDto),
    },
  })
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
    return formatResponse({ genres }, jsonResponse, res);
  }
}
