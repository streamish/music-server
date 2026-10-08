import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserListIndexerLogsBadRequestResponseDto,
  UserListIndexerLogsNotFoundResponseDto,
  UserListIndexerLogsQueryDto,
  UserListIndexerLogsResponseDto,
} from './list-indexer-logs.dto';
import { UserListIndexerLogsService } from './list-indexer-logs.service';

@UserController()
export class UserListIndexerLogsController {
  constructor(private readonly listIndexerLogsService: UserListIndexerLogsService) {}

  @ApiEndpoint(Get, 'list-indexer-logs', HttpStatus.OK, {
    summary: 'Monitor what the indexer is doing for your library',
    description: [
      'Retrieves the most recent indexer logs based on any provided query parameters.',
      `Logs are held in memory and will clear whenever the server restarts.`,
      'The oldest logs will discard as they accumulate beyond the capacity in the `system_configurations` table.',
      'If you have multiple users it may be common for this to be empty as the capacity is filled by other users.',
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserListIndexerLogsResponseDto,
      [HttpStatus.BAD_REQUEST]: UserListIndexerLogsBadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: UserListIndexerLogsNotFoundResponseDto,
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListIndexerLogsQueryDto,
  ): Promise<UserListIndexerLogsResponseDto> {
    const logs = await this.listIndexerLogsService.list(user.id, query.rootPathId, query.search);
    return {
      logs,
      success: true,
    };
  }
}
