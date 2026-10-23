import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetArtistsQueryDto } from './dtos';
import { SubsonicGetArtistsService } from './get-artists.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetArtistsController {
  constructor(private readonly getArtistsService: SubsonicGetArtistsService) {}

  @Get(['getArtists'])
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetArtistsQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const artist = await this.getArtistsService.getArtists(user.id, query.musicFolderId);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          artist,
        },
      };
    }
    return objectToXml({ artist }, 'subsonic-response');
  }
}
