import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicNowPlayingService } from './get-now-playing.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicNowPlayingController {
  constructor(private readonly service: SubsonicNowPlayingService) {}

  @Get(['getNowPlaying', 'getNowPlaying.view'])
  async getNowPlaying(@User() user: AccountEntity, @ResponseFormat() jsonResponse: boolean) {
    const nowPlaying = await this.service.getNowPlaying(user.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      nowPlaying,
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
