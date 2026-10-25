import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicArtistQueryDto, SubsonicArtistResponseDto } from './dtos';
import { SubsonicArtistService } from './get-artist.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicArtistController {
  constructor(private readonly getArtistService: SubsonicArtistService) {}

  @SubsonicApiEndpoint(Get, 'getArtist', HttpStatus.OK, {
    summary: 'Get Artist',
    description: 'Retrieve an artist and its albums.',
    responses: {
      [HttpStatus.OK]: SubsonicArtistResponseDto,
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
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      artist,
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
