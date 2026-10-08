import { AccountEntity } from 'src/database/entities';
import { Body, HttpStatus, Logger, Post } from '@nestjs/common';

import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyComposerBodyDto, SynologyComposerResponseDto } from './dtos/composer.cgi.dto';
import { SynologyComposerService } from './composer.service';
import { User } from '../user.decorator';

@SynologyController()
export class SynologyComposerController {
  private readonly logger: Logger = new Logger(SynologyComposerController.name);

  constructor(private readonly composerService: SynologyComposerService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/composer.cgi', HttpStatus.OK, {
    summary: 'Lists composers in the music library',
    description: [
      'Lists composers found in the music library.',
      'These are extracted from song metadata and are not necessarily the same as the artists.',
      'This field can be problematic due to inconsistent multi-composer values and erratic metadata like job titles.',
      'When a track is recognized as having multiple composers, each composer is counted as a separate composer.',
      'A track with the composer "Composer 1, Composer 2" will be counted as both "Composer 1" and "Composer 2".',
    ].join(' '),
    isAuthenticated: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: SynologyComposerResponseDto,
    },
  })
  async route(
    @User() user: AccountEntity,
    @Body() body: SynologyComposerBodyDto,
  ): Promise<SynologyComposerResponseDto> {
    // Route #1:  list composers
    const data = await this.composerService.listComposers(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
