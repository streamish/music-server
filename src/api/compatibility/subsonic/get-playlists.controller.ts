import { Controller, Get, UseGuards } from '@nestjs/common';
import { ResponseFormat } from './subsonic.decorator';
import { SubsonicAuthGuard } from './subsonic.guard';
import { objectToXml } from 'src/utils/xml';

@Controller('rest')
@UseGuards(SubsonicAuthGuard)
export class SubsonicPlaylistsController {
  // eslint-disable-next-line class-methods-use-this
  @Get(['getPlayLists', 'getPlayLists.view'])
  async getPlayLists(@ResponseFormat() jsonResponse: boolean) {
    const responsePayload = {
      status: 'ok',
      version: '1.16.1',
      playlists: {},
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
