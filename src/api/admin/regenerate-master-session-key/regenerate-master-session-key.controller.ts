import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminRegenerateMasterSessionKeyResponseDto } from './regenerate-master-session-key.dto';
import { AdminRegenerateMasterSessionKeyService } from './regenerate-master-session-key.service';
import { HttpStatus, Post } from '@nestjs/common';
import { User } from 'src/api/user.decorator';

@AdminController()
export class AdminRegenerateMasterSessionKeyController {
  constructor(private readonly regenerateMasterSessionKeyService: AdminRegenerateMasterSessionKeyService) {}

  @ApiEndpoint(Post, 'regenerate-master-session-key', HttpStatus.OK, {
    summary: 'Invalidate all user sessions',
    description: 'Regenerates the master session key for the entire platform, invalidating all sessions for all users.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminRegenerateMasterSessionKeyResponseDto,
    },
  })
  async post(@User() user: AccountEntity): Promise<AdminRegenerateMasterSessionKeyResponseDto> {
    await this.regenerateMasterSessionKeyService.regenerate(user.id);
    return {
      success: true,
    };
  }
}
