import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminListIndexerLogsQueryDto, AdminListIndexerLogsResponseDto } from './list-indexer-logs.dto';
import { AdminListIndexerLogsService } from './list-indexer-logs.service';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { getValidationMessages } from 'src/api/response.dto';

@AdminController()
export class AdminListIndexerLogsController {
  constructor(private readonly listIndexerLogsService: AdminListIndexerLogsService) {}

  @ApiEndpoint(Get, 'list-indexer-logs', HttpStatus.OK, {
    summary: 'Monitor what the indexer is doing for all libraries',
    description: [
      'Retrieves the most recent indexer logs based on any provided query parameters.',
      'Logs are held in memory and will clear whenever the server restarts.',
      'The oldest logs will discard as they accumulate beyond the capacity in the `system_configurations` table.',
    ].join(' '),
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminListIndexerLogsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(AdminListIndexerLogsQueryDto),
    },
  })
  async get(@Query() query: AdminListIndexerLogsQueryDto): Promise<AdminListIndexerLogsResponseDto> {
    const logs = await this.listIndexerLogsService.list(query.accountId, query.rootPathId, query.search);
    return {
      logs,
      success: true,
    };
  }
}
