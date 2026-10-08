import { HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyQueryService } from './query.service';

@SynologyController({ allowGuest: true })
export class SynologyQueryController {
  private readonly logger: Logger = new Logger(SynologyQueryController.name);

  constructor(private readonly queryService: SynologyQueryService) {}

  @SynologyApiEndpoint(Post, '/query.cgi', HttpStatus.OK, {
    summary: 'Returns information about the Synology AudioStation API',
    description: [
      'Provides information to Synology DS Audio apps about the server and its capabilities.',
      'This endpoint omits information that is not relevant to AudioStation.',
    ].join(' '),
  })
  async route() {
    const data = this.queryService.getApiCapabilities();
    return {
      data,
      success: true,
    };
  }
}
