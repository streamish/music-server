import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicTopSongsQueryDto } from './dtos';
import { SubsonicTopSongsService } from './get-top-songs.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicTopSongsController {
  constructor(private readonly service: SubsonicTopSongsService) {}

  @Get(['getTopSongs', 'getTopSongs.view'])
  async getTopSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicTopSongsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const songs = await this.service.getTopSongs(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      topSongs: {
        song: songs,
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
