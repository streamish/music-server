import { AccountEntity } from 'src/database/entities';
import { Get, Header, HttpStatus, Query, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicMusicDirectoryQueryDto, SubsonicMusicDirectoryResponseDto } from './dtos';
import { SubsonicMusicDirectoryService } from './get-music-directory.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicMusicDirectoryController {
  constructor(private readonly getMusicDirectoryService: SubsonicMusicDirectoryService) {}

  @SubsonicApiEndpoint(Get, 'getMusicDirectory', HttpStatus.OK, {
    summary: 'Get Music Directory',
    description: 'Retrieve a music directory and its child items.',
    responses: {
      [HttpStatus.OK]: SubsonicMusicDirectoryResponseDto,
    },
  })
  @Header('server', 'Jetty(6.1.x)')
  async getMusicDirectory(
    @User() user: AccountEntity,
    @Query() query: SubsonicMusicDirectoryQueryDto,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('set-cookie', [
      `player-${user.username}=2;Path=/;Expires=Sat, 23-Oct-27 23:58:03 GMT`,
      `JSESSIONID=${user.id}-${user.username};Path=/`,
    ]);
    const musicFolder = await this.getMusicDirectoryService.getMusicDirectory(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      musicDirectory: {
        musicFolder,
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
