import { Get, HttpStatus, Query } from '@nestjs/common';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import { QnapSysRequestDto, QnapSysRequestQueryDto } from './dtos/sys-request.dto';
import { QnapSysRequestService } from './sys-request.service';
import { objectToXml } from 'src/utils/xml';

@QnapController({ allowGuest: true })
export class QnapSysRequestController {
  constructor(private readonly sysRequestApiService: QnapSysRequestService) {}

  @QnapApiEndpoint(Get, '/sys/sysRequest.cgi', HttpStatus.OK, {
    summary: 'System configuration for iPhone',
    description: [
      'Part of the QNAP authentication chain',
      'This endpoint returns information to the QMusic iPhone app as part of the authentication process.',
    ].join('\n'),
    responses: {
      [HttpStatus.OK]: [QnapSysRequestDto],
    },
  })
  async routeRequest(@Query() query: QnapSysRequestQueryDto) {
    const system = await this.sysRequestApiService.getSystem(query.sid);
    return objectToXml({ ...system }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
