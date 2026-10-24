import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicRandomSongsQueryDto } from './dtos';
import { SubsonicRandomSongsService } from './get-random-songs.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicRandomSongsController {
  constructor(private readonly service: SubsonicRandomSongsService) {}

  @Get(['getRandomSongs', 'getRandomSongs.view'])
  async getRandomSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicRandomSongsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const songs = await this.service.getRandomSongs(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      randomSongs: {
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
