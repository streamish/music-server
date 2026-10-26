import { Get, HttpStatus, Res } from '@nestjs/common';
import { IsJsonResponse, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { SubsonicMusicFoldersResponseDto } from './dtos';
import { SubsonicMusicFoldersService } from './get-music-folders.service';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicMusicFoldersController {
  constructor(private readonly getMusicFoldersService: SubsonicMusicFoldersService) {}

  @SubsonicApiEndpoint(Get, 'getMusicFolders', HttpStatus.OK, {
    summary: 'Get Music Folders',
    description: 'Retrieve the configured music folders.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicMusicFoldersResponseDto),
    },
  })
  async getMusicFolders(@IsJsonResponse() isJsonResponse: boolean, @Res({ passthrough: true }) res: Response) {
    const musicFolder = await this.getMusicFoldersService.getMusicFolders();
    return formatResponse({ musicFolders: { musicFolder } }, isJsonResponse, res);
  }
}
