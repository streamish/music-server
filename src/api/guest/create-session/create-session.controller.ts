import { ApiEndpoint, GuestController } from 'src/api/api.decorator';
import { Body, HttpStatus, Post, Req } from '@nestjs/common';
import {
  GuestCreateSessionBadRequestResponseDto,
  GuestCreateSessionBodyDto,
  GuestCreateSessionResponseDto,
} from './create-session.dto';
import { GuestCreateSessionService } from './create-session.service';
import { InternalServerErrorResponseDto } from 'src/api/response.dto';
import type { Request } from 'express';

@GuestController()
export class GuestCreateSessionController {
  constructor(private readonly createSessionService: GuestCreateSessionService) {}

  @ApiEndpoint(Post, 'create-session', HttpStatus.CREATED, {
    summary: 'Sign in',
    description: [
      'Creates a user session and returns a JWT token used for authenticated API requests.',
      'The session can be lasting or temporary.',
      'Sessions are locked to the APIs that created them, these tokens cannot access QNAP or Synology APIs.',
    ].join('\n'),
    responses: {
      [HttpStatus.CREATED]: GuestCreateSessionResponseDto,
      [HttpStatus.BAD_REQUEST]: GuestCreateSessionBadRequestResponseDto,
      [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorResponseDto,
    },
  })
  async post(@Req() req: Request, @Body() body: GuestCreateSessionBodyDto): Promise<GuestCreateSessionResponseDto> {
    const userAgent = req.headers['user-agent'] || '';
    const jwtToken = await this.createSessionService.post(userAgent, body);
    return {
      success: true,
      jwtToken,
    };
  }
}
