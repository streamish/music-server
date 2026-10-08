import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { HttpStatus, Post } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRegenerateSessionKeyResponseDto } from './regenerate-session-key.dto';
import { UserRegenerateSessionKeyService } from './regenerate-session-key.service';

@UserController()
export class UserRegenerateSessionKeyController {
  constructor(private readonly regenerateSessionKeyService: UserRegenerateSessionKeyService) {}

  @ApiEndpoint(Post, 'regenerate-session-key', HttpStatus.OK, {
    summary: `Invalidate a user's sessions`,
    description: [
      'Regenerates the session key for the user.  This key is used to sign their session tokens.',
      'When a new key is generated any previous sessions of the user become invalid including their current session.',
      'The user will need to authenticate again to continue accessing protected APIs.',
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserRegenerateSessionKeyResponseDto,
    },
  })
  async post(@User() user: AccountEntity): Promise<UserRegenerateSessionKeyResponseDto> {
    await this.regenerateSessionKeyService.regenerateSessionKey(user.id);
    return {
      success: true,
    };
  }
}
