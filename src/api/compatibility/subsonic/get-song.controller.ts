import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { SubsonicSongQueryDto, SubsonicSongResponseDto } from './dtos';
import { SubsonicSongService } from './get-song.service';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicSongController {
  constructor(private readonly service: SubsonicSongService) {}

  @SubsonicApiEndpoint(Get, 'getSong', HttpStatus.OK, {
    summary: 'Get Song',
    description: 'Retrieve a song by its identifier.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicSongResponseDto),
    },
  })
  async getSong(
    @User() user: AccountEntity,
    @Query() query: SubsonicSongQueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const song = await this.service.getSong(user.id, query);
    return formatResponse({ song }, isJsonResponse, res);
  }
}
