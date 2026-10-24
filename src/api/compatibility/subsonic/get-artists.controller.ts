import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicArtistsQueryDto } from './dtos';
import { SubsonicArtistsService } from './get-artists.service';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicArtistsController {
  constructor(private readonly getArtistsService: SubsonicArtistsService) {}

  @Get(['getArtists'])
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicArtistsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const artist = await this.getArtistsService.getArtists(user.id, query.musicFolderId);
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
