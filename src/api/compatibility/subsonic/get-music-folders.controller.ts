import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetMusicFoldersService } from './get-music-folders.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetMusicFoldersController {
  constructor(private readonly getMusicFoldersService: SubsonicGetMusicFoldersService) {}

  @Get('getMusicFolders')
  async getMusicFolders(@User() user: AccountEntity, @ResponseFormat() jsonResponse: boolean) {
    const musicFolder = await this.getMusicFoldersService.getMusicFolders(user.id);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          musicFolders: {
            musicFolder,
          },
        },
      };
    }
    return objectToXml({ musicFolders: { musicFolder } }, 'subsonic-response');
  }
}
