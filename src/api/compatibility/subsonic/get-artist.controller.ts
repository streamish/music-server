import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicArtistQueryDto, SubsonicArtistResponseDto } from './dtos';
import { SubsonicArtistService } from './get-artist.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicArtistController {
  constructor(private readonly getArtistService: SubsonicArtistService) {}

  @SubsonicApiEndpoint(Get, 'getArtist', HttpStatus.OK, {
    summary: 'Get Artist',
    description: 'Retrieve an artist and its albums.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicArtistResponseDto),
    },
  })
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicArtistQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const artist = await this.getArtistService.getArtist(user.id, query.id);
    return formatResponse(
      {
        artist,
      },
      jsonResponse,
      res,
    );
  }
}
