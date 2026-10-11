import {} from './dtos/regenerate-user-session-key.dto';
import { AccountEntity, SessionEntity } from 'src/database/entities';
import { AdminAuthorizationBodyDto } from '../request.dto';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiSessionsService } from './sessions.service';
import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Query, Req, Session } from '@nestjs/common';
import { CreateSessionBodyDto, CreateSessionResponseDto, RegenerateUserSessionKeyQueryDto } from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { SuccessResponseDto, getValidationMessages } from '../response.dto';
import { User } from '../user.decorator';
import type { Request } from 'express';

@Controller('/api')
export class ApiSessionsController {
  constructor(private readonly sessionsService: ApiSessionsService) {}

  @ApiEndpoint(Post, 'create-session', HttpStatus.CREATED, {
    summary: 'Sign in',
    description: [
      'Creates a user session and returns a JWT token used for authenticated API requests.',
      'The session can be lasting or temporary.',
      'Sessions are locked to the APIs that created them, these tokens cannot access QNAP or Synology APIs.',
    ].join(' '),
    allowGuest: true,
    responses: {
      [HttpStatus.CREATED]: CreateSessionResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.INVALID_USERNAME_ERROR],
      [HttpStatus.BAD_REQUEST]: [ErrorCodes.INVALID_PASSWORD_ERROR, ...getValidationMessages(CreateSessionBodyDto)],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async createSession(@Req() req: Request, @Body() body: CreateSessionBodyDto) {
    const userAgent = req.headers['user-agent'] || '';
    const jwtToken = await this.sessionsService.createSession(userAgent, body);
    return {
      success: true,
      jwtToken,
    };
  }

  @ApiEndpoint(Delete, 'end-session', HttpStatus.OK, {
    summary: 'Terminate the session',
    description: 'Ends a user session and invalidates the JWT token provided in the `Authorization` header.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.BAD_REQUEST]: [ErrorCodes.SESSION_NOT_FOUND_ERROR, ErrorCodes.INVALID_SESSION_ERROR],
    },
  })
  async delete(@Session() session: SessionEntity) {
    await this.sessionsService.deleteSession(session.id);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Post, 'regenerate-master-session-key', HttpStatus.OK, {
    summary: 'Invalidate all user sessions',
    description: [
      'Regenerates the master session key for the entire platform, used to sign all session tokens.',
      'When a new master key is generated every single session immediately becomes invalid.',
    ].join(' '),
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
    },
  })
  async regenerateMasterSessionKey(@User() user: AccountEntity) {
    await this.sessionsService.regenerateMasterSessionKey(user.id);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Post, 'regenerate-user-session-key', HttpStatus.OK, {
    summary: `Invalidate a user's sessions`,
    description: [
      'Regenerates the session key for the specified user, used to sign their session tokens.',
      'When a new key is generated all sessions of the user immediately invalidate, including their current session.',
      'The user will need to authenticate again to continue accessing protected APIs.',
    ].join(' '),
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(AdminAuthorizationBodyDto),
        ...getValidationMessages(RegenerateUserSessionKeyQueryDto),
      ],
    },
  })
  async regenerateUserSessionKey(
    @User() user: AccountEntity,
    @Query() query: RegenerateUserSessionKeyQueryDto,
    @Body() body: AdminAuthorizationBodyDto,
  ) {
    await this.sessionsService.regenerateUserSessionKey(user.id, body.adminPassword, query.id);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Post, 'regenerate-session-key', HttpStatus.OK, {
    summary: `Invalidate a user's sessions`,
    description: [
      'Regenerates the session key for the user, used to sign their session tokens.',
      'When a new key is generated all sessions of the user immediately invalidate, including their current session.',
      'The user will need to authenticate again to continue accessing protected APIs.',
    ].join(' '),
    allowUser: true,
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
    },
  })
  async regenerateSessionKey(@User() user: AccountEntity) {
    await this.sessionsService.regenerateSessionKey(user.id);
    return {
      success: true,
    };
  }
}
