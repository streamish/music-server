import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicNowPlayingResponseDto } from './dtos';
import { SubsonicNowPlayingService } from './get-now-playing.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicNowPlayingController {
  constructor(private readonly service: SubsonicNowPlayingService) {}

  @SubsonicApiEndpoint(Get, 'getNowPlaying', HttpStatus.OK, {
    summary: 'Get Now Playing',
    description: 'Retrieve the songs currently being played.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicNowPlayingResponseDto),
    },
  })
  async getNowPlaying(
    @User() user: AccountEntity,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const nowPlaying = await this.service.getNowPlaying(user.id);
    return formatResponse({ nowPlaying }, isJsonResponse, res);
  }
}
