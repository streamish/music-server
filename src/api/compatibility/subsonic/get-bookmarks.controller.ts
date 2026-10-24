import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicBookmarksController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getBookmarks', 'getBookmarks.view'])
  async getBookmarks(@ResponseFormat() jsonResponse: boolean) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      bookmarks: {},
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
