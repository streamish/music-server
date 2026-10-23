import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetAlbumListQueryDto } from './dtos';
import { SubsonicGetAlbumListService } from './get-album-list.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetAlbumListController {
  constructor(private readonly getAlbumListService: SubsonicGetAlbumListService) {}

  @Get('getAlbum')
  async getAlbum(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetAlbumListQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const album = await this.getAlbumListService.getAlbumList(user.id, query);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          albumList: {
            album,
          },
        },
      };
    }
    return objectToXml({ albumList: { album } }, 'subsonic-response');
  }
}
