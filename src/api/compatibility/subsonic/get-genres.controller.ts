import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGenresService } from './get-genres.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicGenresController {
  constructor(private readonly service: SubsonicGenresService) {}

  @Get(['getGenres', 'getGenres.view'])
  async getGenres(@User() user: AccountEntity, @ResponseFormat() jsonResponse: boolean) {
    const genres = await this.service.getGenres(user.id);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      genres,
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
