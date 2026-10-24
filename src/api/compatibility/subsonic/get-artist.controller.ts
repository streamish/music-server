import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicArtistQueryDto } from './dtos';
import { SubsonicArtistService } from './get-artist.service';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicArtistController {
  constructor(private readonly getArtistService: SubsonicArtistService) {}

  @Get(['getArtist', 'getArtist.view'])
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicArtistQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const artist = await this.getArtistService.getArtist(user.id, query.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      artist,
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
