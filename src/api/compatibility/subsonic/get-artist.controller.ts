import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetArtistQueryDto } from './dtos';
import { SubsonicGetArtistService } from './get-artist.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetArtistController {
  constructor(private readonly getArtistService: SubsonicGetArtistService) {}

  @Get('getArtist')
  async getArtists(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetArtistQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const artist = await this.getArtistService.getArtist(user.id, query.id);
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
