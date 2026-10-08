import { ApiEndpoint, GuestController } from 'src/api/api.decorator';
import { Get, HttpStatus } from '@nestjs/common';

@GuestController()
export class GuestHealthcheckController {
  // eslint-disable-next-line class-methods-use-this
  @ApiEndpoint(Get, 'healthcheck', HttpStatus.OK, {
    summary: 'Healthcheck',
    description: 'Checks the health status of the server.',
    responses: {
      [HttpStatus.OK]: Object,
    },
  })
  healthcheck() {
    return { status: 'ok' };
  }
}
