import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetAlbumList2QueryDto } from './dtos';
import { SubsonicGetAlbumList2Service } from './get-album.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetAlbumList2Controller {
  constructor(private readonly getAlbumList2Service: SubsonicGetAlbumList2Service) {}

  @Get('getAlbum')
  async getAlbum(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetAlbumList2QueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const album = await this.getAlbumList2Service.getAlbumList(user.id, query);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          albumList2: {
            album,
          },
        },
      };
    }
    return objectToXml({ albumList2: { album } }, 'subsonic-response');
  }
}
