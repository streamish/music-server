import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminRegenerateUserSessionKeyQueryDto,
  AdminRegenerateUserSessionKeyResponseDto,
} from './regenerate-user-session-key.dto';
import { AdminRegenerateUserSessionKeyService } from './regenerate-user-session-key.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { HttpStatus, Post, Query } from '@nestjs/common';

@AdminController()
export class AdminRegenerateUserSessionKeyController {
  constructor(private readonly regenerateSessionKeyService: AdminRegenerateUserSessionKeyService) {}

  @ApiEndpoint(Post, 'regenerate-user-session-key', HttpStatus.OK, {
    summary: `Invalidate a user's sessions`,
    description: 'Regenerates the master session key for a specific user, invalidating all sessions for that user.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminRegenerateUserSessionKeyResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    },
  })
  async post(@Query() query: AdminRegenerateUserSessionKeyQueryDto): Promise<AdminRegenerateUserSessionKeyResponseDto> {
    await this.regenerateSessionKeyService.regenerateSessionKey(query.id);
    return {
      success: true,
    };
  }
}
