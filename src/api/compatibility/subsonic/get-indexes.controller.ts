import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicIndexesQueryDto } from './dtos';
import { SubsonicIndexesService } from './get-indexes.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicIndexesController {
  constructor(private readonly getIndexesService: SubsonicIndexesService) {}

  @Get(['getIndexes'])
  async getIndexes(
    @User() user: AccountEntity,
    @Query() query: SubsonicIndexesQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const indexes = await this.getIndexesService.getIndexes(user.id, query.musicFolderId);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      indexes,
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
