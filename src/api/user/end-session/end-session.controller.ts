import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Delete, HttpStatus, Logger } from '@nestjs/common';
import { Session } from 'src/api/session.decorator';
import { SessionEntity } from 'src/database/entities';
import { SuccessResponseDto } from 'src/api/response.dto';
import { UserEndSessionService } from './end-session.service';

@UserController()
export class UserEndSessionController {
  private readonly logger: Logger = new Logger(UserEndSessionController.name);

  constructor(private readonly endSessionService: UserEndSessionService) {}

  @ApiEndpoint(Delete, 'end-session', HttpStatus.OK, {
    summary: 'Terminate the session',
    description: ['Ends a user session and invalidates the JWT token provided in the `Authorization` header.'].join(
      '\n',
    ),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
    },
  })
  async delete(@Session() session: SessionEntity): Promise<SuccessResponseDto> {
    try {
      const success = await this.endSessionService.delete(session);
      return {
        success,
      };
    } catch (error) {
      this.logger.error('Error ending session:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
