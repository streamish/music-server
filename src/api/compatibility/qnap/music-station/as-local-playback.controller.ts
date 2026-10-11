import { HttpStatus, Post, Query } from '@nestjs/common';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import { QnapAsLocalPlaybackQueryDto } from './dtos/as-local-playback.dto';
import { QnapAsLocalPlaybackService } from './as-local-playback.service';
import { objectToXml } from 'src/utils/xml';

@QnapController()
export class QnapAsLocalPlaybackController {
  constructor(private readonly qnapAsLocalPlaybackApiService: QnapAsLocalPlaybackService) {}

  @QnapApiEndpoint(Post, 'as_localplayback.php', HttpStatus.OK, {
    summary: 'Handles local playback requests from QMusic clients',
    description: 'This endpoint manages local playback status for QMusic clients.',
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post(@Query() query: QnapAsLocalPlaybackQueryDto) {
    const status = await this.qnapAsLocalPlaybackApiService.getStatus();
    return objectToXml(status, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
