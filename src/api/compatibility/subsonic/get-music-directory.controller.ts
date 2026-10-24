import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicMusicDirectoryQueryDto } from './dtos/get-music-directory.dto';
import { SubsonicMusicDirectoryService } from './get-music-directory.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicMusicDirectoryController {
  constructor(private readonly getMusicDirectoryService: SubsonicMusicDirectoryService) {}

  @Get(['getMusicDirectory', 'getMusicDirectory.view'])
  async getMusicDirectory(
    @User() user: AccountEntity,
    @Query() query: SubsonicMusicDirectoryQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const musicFolder = await this.getMusicDirectoryService.getMusicDirectory(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      musicDirectory: {
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
