import { AccountEntity } from 'src/database/entities';
import { Get, HttpStatus, Res } from '@nestjs/common';
import { ResponseFormat, SubsonicApiEndpoint, SubsonicController } from './subsonic.decorator';
import { ShoutcastService } from 'src/shoutcast/shoutcast.service';
import { SubsonicInternetRadioStationsResponseDto } from './dtos';
import { SubsonicResponseEnvelopeDtoFactory } from './subsonic.dto';
import { User } from 'src/api/user.decorator';
import { formatResponse } from './subsonic.response';
import type { Response } from 'express';

@SubsonicController()
export class SubsonicInternetRadioStationsController {
  constructor(private readonly shoutcastService: ShoutcastService) {}

  @SubsonicApiEndpoint(Get, 'getInternetRadioStations', HttpStatus.OK, {
    summary: 'Get Internet Radio Stations',
    description: 'Retrieve configured internet radio stations, ranked by play count.',
    responses: {
      [HttpStatus.OK]: SubsonicResponseEnvelopeDtoFactory(SubsonicInternetRadioStationsResponseDto),
    },
  })
  async getInternetRadioStations(
    @User() user: AccountEntity,
    @ResponseFormat() jsonResponse: boolean,
    @Res({ passthrough: true }) res: Response,
  ) {
    const stations = await this.shoutcastService.listMostPlayedStations(user.id, 100_000);
    return formatResponse({ internetRadioStations: stations }, jsonResponse, res);
  }
}
