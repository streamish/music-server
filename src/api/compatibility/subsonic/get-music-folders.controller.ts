import { Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicMusicFoldersResponseDto } from './dtos';
import { SubsonicMusicFoldersService } from './get-music-folders.service';
import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicMusicFoldersController {
  constructor(private readonly getMusicFoldersService: SubsonicMusicFoldersService) {}

  @SubsonicApiEndpoint(Get, 'getMusicFolders', HttpStatus.OK, {
    summary: 'Get Music Folders',
    description: 'Retrieve the configured music folders.',
    responses: {
      [HttpStatus.OK]: SubsonicMusicFoldersResponseDto,
    },
  })
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
