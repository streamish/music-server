import { ApiExtraModels } from '@nestjs/swagger';
import { HttpStatus, Post, Query } from '@nestjs/common';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import { QnapMediaToolQueryDto, QnapMediaToolResponseDto } from './dtos/media-tool.dto';
import { QnapMediaToolService } from './media-tool.service';
import { objectToXml } from 'src/utils/xml';

@QnapController()
export class QnapMediaToolController {
  constructor(private readonly mediaToolApiService: QnapMediaToolService) {}

  @QnapApiEndpoint(Post, 'mediatool_api.php', HttpStatus.OK, {
    summary: 'Reports IP addresses to mobile apps',
    description: 'This endpoint reports the LAN and WAN IP addresses and ports to mobile clients.',
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: [QnapMediaToolResponseDto],
    },
  })
  @ApiExtraModels(QnapMediaToolResponseDto)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(@Query() query: QnapMediaToolQueryDto | unknown) {
    const info = await this.mediaToolApiService.getIpList();
    return objectToXml(
      {
        status: 1,
        ...info,
      },
      'QDocRoot version="1.0"',
      'QDocRoot',
    );
  }
}
