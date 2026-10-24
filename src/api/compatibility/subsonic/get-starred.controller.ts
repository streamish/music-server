import { AccountEntity } from 'src/database/entities/account.entity';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { User } from 'src/api/user.decorator';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicStarredController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getStarred', 'getStarred.view'])
  async getStarred(@User() user: AccountEntity, @ResponseFormat() jsonResponse: boolean) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      starred: {},
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

  // eslint-disable-next-line class-methods-use-this
  @Get(['getStarred2', 'getStarred2.view'])
  async getStarred2(@User() user: AccountEntity, @ResponseFormat() jsonResponse: boolean) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      starred: {},
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
