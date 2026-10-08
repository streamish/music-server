import { Body, HttpStatus, Post, Query } from '@nestjs/common';
import { QnapApiEndpoint, QnapController } from './qnap.decorator';
import { QnapAsLoginBodyDto, QnapAsLoginQueryDto, QnapUserAsLoginDto } from './dtos/as-login.dto';
import { QnapAsLoginService } from './as-login.service';
import { objectToXml } from 'src/utils/xml';

@QnapController({ allowGuest: true })
export class QnapAsLoginController {
  constructor(private readonly qnapAsLoginApiService: QnapAsLoginService) {}

  @QnapApiEndpoint(Post, 'as_login_api.php', HttpStatus.OK, {
    summary: 'System configuration for iPhone',
    description: [
      [
        'Part of the QNAP authentication chain',
        'This endpoint returns information to the iPhone and Android apps as part of the authentication process.',
        'The JWT token is sent as `ssid` in the querystring by the Android app and in the POST body by the iOS app.',
      ].join('\n'),
    ].join('\n'),
    responses: {
      [HttpStatus.OK]: [QnapUserAsLoginDto],
    },
  })
  async post(@Query() query?: QnapAsLoginQueryDto, @Body() body?: QnapAsLoginBodyDto) {
    const sessionToken = query?.ssid || body?.ssid || '';
    if (sessionToken) {
      const configuration = await this.qnapAsLoginApiService.getConfiguration(sessionToken);
      return objectToXml({ ...configuration }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    return objectToXml({ status: 1 }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
