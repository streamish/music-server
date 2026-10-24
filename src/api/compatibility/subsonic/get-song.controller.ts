import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicSongQueryDto } from './dtos';
import { SubsonicSongService } from './get-song.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicSongController {
  constructor(private readonly service: SubsonicSongService) {}

  @Get(['getSong', 'getSong.view'])
  async getSong(
    @User() user: AccountEntity,
    @Query() query: SubsonicSongQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const song = await this.service.getSong(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      song,
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
