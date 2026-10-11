import { Body, Headers, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyInfoBodyDto, SynologyInfoResponseDto } from './dtos/info.cgi.dto';
import { SynologyInfoService } from './info.service';

@SynologyController()
export class SynologyInfoController {
  private readonly logger: Logger = new Logger(SynologyInfoController.name);

  constructor(private readonly infoService: SynologyInfoService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/info.cgi', HttpStatus.OK, {
    summary: 'Returns configuration information for the Synology AudioStation API and client capabilities',
    description: 'This endpoint returns configuration information for the Synology DS Audio apps.',
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: SynologyInfoResponseDto,
    },
  })
  async route(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() body: SynologyInfoBodyDto,
    @Headers('id') sessionTokenHash: string,
  ): Promise<SynologyInfoResponseDto> {
    const data = await this.infoService.getConfiguration(sessionTokenHash);
    return {
      data,
      success: true,
    };
  }
}
