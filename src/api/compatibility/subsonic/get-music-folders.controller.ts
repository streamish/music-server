import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicMusicFoldersService } from './get-music-folders.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicMusicFoldersController {
  constructor(private readonly getMusicFoldersService: SubsonicMusicFoldersService) {}

  @Get(['getMusicFolders', 'getMusicFolders.view'])
  async getMusicFolders(@User() user: AccountEntity, @ResponseFormat() jsonResponse: boolean) {
    const musicFolder = await this.getMusicFoldersService.getMusicFolders(user.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      musicFolders: {
        musicFolder,
      },
    };
    if (jsonResponse) {
      return {
        'subsonic-response': {
          ...responsePayload,
        },
      };
    }
    return objectToXml({ ...responsePayload }, 'subsonic-response');
  }
}
