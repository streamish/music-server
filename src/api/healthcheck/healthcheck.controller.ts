/* eslint-disable max-classes-per-file */
import { ApiEndpoint } from 'src/api/api.decorator';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { IsString } from 'class-validator';

class HealthcheckResponseDto {
  @IsString()
  declare status: string;
}

@Controller('/api')
export class ApiHealthcheckController {
  // eslint-disable-next-line class-methods-use-this
  @ApiEndpoint(Get, 'healthcheck', HttpStatus.OK, {
    summary: 'Healthcheck',
    description: 'Checks the health status of the server.',
    allowGuest: true,
    responses: {
      [HttpStatus.OK]: HealthcheckResponseDto,
    },
  })
  healthcheck(): HealthcheckResponseDto {
    return { status: 'ok' };
  }
}
