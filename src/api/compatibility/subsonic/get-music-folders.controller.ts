import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicMusicFoldersService } from './get-music-folders.service';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicMusicFoldersController {
  constructor(private readonly getMusicFoldersService: SubsonicMusicFoldersService) {}

  @Get(['getMusicFolders', 'getMusicFolders.view'])
  @Header('server', 'Jetty(6.1.x)')
  async getMusicFolders(@ResponseFormat() jsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const musicFolder = await this.getMusicFoldersService.getMusicFolders();
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      musicFolders: {
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
