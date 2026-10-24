import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicSongsByGenreQueryDto } from './dtos';
import { SubsonicSongsByGenreService } from './get-songs-by-genre.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicSongsByGenreController {
  constructor(private readonly service: SubsonicSongsByGenreService) {}

  @Get(['getSongsByGenre', 'getSongsByGenre.view'])
  async getSongsByGenre(
    @User() user: AccountEntity,
    @Query() query: SubsonicSongsByGenreQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const songs = await this.service.getSongsByGenre(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      songsByGenre: {
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
