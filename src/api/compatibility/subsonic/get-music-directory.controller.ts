import { AccountEntity } from 'src/database/entities';
import { Controller, Get, Header, Query, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { SubsonicMusicDirectoryQueryDto } from './dtos/get-music-directory.dto';
import { SubsonicMusicDirectoryService } from './get-music-directory.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseFilters(SubsonicExceptionFilter)
@UseGuards(SubsonicAuthGuard)
export class SubsonicMusicDirectoryController {
  constructor(private readonly getMusicDirectoryService: SubsonicMusicDirectoryService) {}

  @Get(['getMusicDirectory', 'getMusicDirectory.view'])
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
