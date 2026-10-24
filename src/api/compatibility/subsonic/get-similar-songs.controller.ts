import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicSimilarSongsQueryDto } from './dtos';
import { SubsonicSimilarSongsService } from './get-similar-songs.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicSimilarSongsController {
  constructor(private readonly service: SubsonicSimilarSongsService) {}

  @Get(['getSimilarSongs', 'getSimilarSongs.view'])
  async getSimilarSongs(
    @User() user: AccountEntity,
    @Query() query: SubsonicSimilarSongsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const songs = await this.service.getSimilarSongs(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      similarSongs: {
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
