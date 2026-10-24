import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicSearchQueryDto } from './dtos';
import { SubsonicSearchService } from './search.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicSearchController {
  constructor(private readonly service: SubsonicSearchService) {}

  @Get(['search', 'search.view'])
  async search(
    @User() user: AccountEntity,
    @Query() query: SubsonicSearchQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const searchResult = await this.service.search(user.id, query);
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      searchResult,
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
