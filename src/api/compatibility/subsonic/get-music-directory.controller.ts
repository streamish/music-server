import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Query, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicMusicDirectoryQueryDto, SubsonicMusicDirectoryResponseDto } from './dtos';
import { SubsonicMusicDirectoryService } from './get-music-directory.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicMusicDirectoryController {
  constructor(private readonly getMusicDirectoryService: SubsonicMusicDirectoryService) {}

  @SubsonicApiEndpoint(Get, 'getMusicDirectory', HttpStatus.OK, {
    summary: 'Get Music Directory',
    description: 'Retrieve a music directory and its child items.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicMusicDirectoryResponseDto),
    },
  })
  async getMusicDirectory(
    @User() user: AccountEntity,
    @Query() query: SubsonicMusicDirectoryQueryDto,
    @IsJsonResponse() isJsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const musicFolder = await this.getMusicDirectoryService.getMusicDirectory(user.id, query.id);
    return formatResponse({ musicDirectory: { musicFolder } }, isJsonResponse, res);
  }
}
