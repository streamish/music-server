import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { SubsonicGetIndexesQueryDto } from './dtos';
import { SubsonicGetIndexesService } from './get-indexes.service';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubsonicGetIndexesController {
  constructor(private readonly getIndexesService: SubsonicGetIndexesService) {}

  @Get(['getIndexes'])
  async getIndexes(
    @User() user: AccountEntity,
    @Query() query: SubsonicGetIndexesQueryDto,
    @ResponseFormat() jsonResponse: boolean,
  ) {
    const indexes = await this.getIndexesService.getIndexes(user.id, query.musicFolderId);
    if (jsonResponse) {
      return {
        'subsonic-response': {
          indexes,
        },
      };
    }
    return objectToXml({ indexes }, 'subsonic-response');
  }
}
