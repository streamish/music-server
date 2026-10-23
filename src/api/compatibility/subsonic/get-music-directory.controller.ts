import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetMusicDirectoryQueryDto } from './dtos/get-music-directory.dto';
import { SubsonicGetMusicDirectoryService } from './get-music-directory.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetMusicDirectoryController {
  constructor(private readonly getMusicDirectoryService: SubsonicGetMusicDirectoryService) {}

  @Get('getMusicDirectory')
  async getMusicDirectory(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetMusicDirectoryQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const musicFolder = await this.getMusicDirectoryService.getMusicDirectory(user.id, query.id);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          musicDirectory: {
            musicFolder,
          },
        },
      };
    }
    return objectToXml({ musicDirectory: { musicFolder } }, 'subsonic-response');
  }
}
