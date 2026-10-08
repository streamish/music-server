import { AllowGuest } from '../role.guard';
import { Body, Get, HttpStatus, Logger, Post, Query, Res } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import {
  SynologyProxyDeleteSongInfoBodyDto,
  SynologyProxySongInfoBodyDto,
  SynologyProxySongInfoResponseDto,
  SynologyProxyStreamInfoBodyDto,
  SynologyProxyStreamInfoResponseDto,
  SynologyProxyStreamQueryDto,
} from './dtos/proxy.cgi.dto';
import { SynologyProxyService } from './proxy.service';
import { SynologySuccessResponseDto } from './synology.response.dto';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';

@SynologyController()
export class SynologyProxyController {
  private readonly logger: Logger = new Logger(SynologyProxyController.name);

  constructor(private readonly proxyService: SynologyProxyService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/proxy.cgi', HttpStatus.OK, {
    summary: 'Proxies SHOUTcast radio streams',
    description: `Creates and terminates a basic HTTP proxy to a SHOUTcast radio stream.`,
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: [
        SynologyProxyStreamInfoResponseDto,
        SynologyProxySongInfoResponseDto,
        SynologySuccessResponseDto,
      ],
    },
    bodyModels: [SynologyProxyStreamInfoBodyDto, SynologyProxySongInfoBodyDto, SynologyProxyDeleteSongInfoBodyDto],
  })
  async route(
    @Body()
    variousBodies: SynologyProxyStreamInfoBodyDto | SynologyProxySongInfoBodyDto | SynologyProxyDeleteSongInfoBodyDto,
  ): Promise<SynologyProxyStreamInfoResponseDto | SynologyProxySongInfoResponseDto | SynologySuccessResponseDto> {
    if (variousBodies.method === 'getstreamid') {
      // this request can come in two formats:
      // 1) `id` of the SHOUTcast radio station is `radio_<station title> <station url>`
      // 2) `id` of the SHOUTcast radio station is `<container>_<genre> <favorite title>`
      const body = plainToInstance(SynologyProxyStreamInfoBodyDto, variousBodies);
      const data = await this.proxyService.createStream(body.id);
      return {
        data,
        success: true,
      };
    }
    if (variousBodies.method === 'deletesonginfo') {
      const body = plainToInstance(SynologyProxyDeleteSongInfoBodyDto, variousBodies);
      await this.proxyService.deleteSongInfo(body.stream_id);
      return {
        success: true,
      };
    }
    const body = plainToInstance(SynologyProxySongInfoBodyDto, variousBodies);
    const data = await this.proxyService.getCurrentSongInfo(body.stream_id);
    return {
      data,
      success: true,
    };
  }

  @SynologyApiEndpoint(Get, '/AudioStation/proxy.cgi', HttpStatus.OK, {
    summary: 'Proxies SHOUTcast radio streams',
    description: 'Pipes the SHOUTcast radio stream to the client.',
  })
  @AllowGuest()
  async getProxyCgi(@Query() query: SynologyProxyStreamQueryDto, @Res() response: Response): Promise<void> {
    this.proxyService.proxyStream(query.stream_id, response);
  }
}
