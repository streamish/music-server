import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicArtistsQueryDto, SubsonicArtistsResponseDto } from './dtos';
import { SubsonicArtistsService } from './get-artists.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicArtistsController {
  constructor(private readonly getArtistsService: SubsonicArtistsService) {}

  @SubsonicApiEndpoint(Get, 'getArtists', HttpStatus.OK, {
    summary: 'Get Artists',
    description: 'Retrieve an indexed list of artists.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicArtistsResponseDto),
    },
  })
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicArtistsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const artist = await this.getArtistsService.getArtists(user.id, query.musicFolderId);
    return formatResponse(
      {
        artist,
      },
      jsonResponse,
      res,
    );
  }
}
