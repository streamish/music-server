import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetAlbumQueryDto } from './dtos';
import { SubsonicGetAlbumService } from './get-album.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetAlbumController {
  constructor(private readonly getAlbumService: SubsonicGetAlbumService) {}

  @Get('getAlbum')
  async getAlbum(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetAlbumQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const album = await this.getAlbumService.getAlbum(user.id, query.id);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          album,
        },
      };
    }
    return objectToXml({ album }, 'subsonic-response');
  }
}
