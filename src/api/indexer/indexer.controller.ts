import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from '../api.decorator';
import { ApiIndexerService } from './indexer.service';
import { Body, Controller, Get, HttpStatus, Patch, Query } from '@nestjs/common';
import {
  IndexerConfigurationResponseDto,
  ListIndexerLogsQueryDto,
  ListIndexerLogsResponseDto,
  ListIndexerLogsWithUserQueryDto,
  ListIndexerLogsWithUserResponseDto,
  SetIndexerStatusBodyDto,
} from './dtos';
import { SuccessResponseDto, getValidationMessages } from '../response.dto';
import { User } from '../user.decorator';

@Controller('/api')
export class ApiIndexerController {
  constructor(private readonly indexerService: ApiIndexerService) {}

  /**
   * `GET` requests to `/api/indexer-configuration`
   * @returns
   */
  @ApiEndpoint(Get, 'indexer-configuration', HttpStatus.OK, {
    summary: 'Get the indexer configuration',
    description:
      'Retrieves the current indexer configuration for the platform.  This is currently limited to "on" or "off".',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: IndexerConfigurationResponseDto,
    },
  })
  async indexerConfiguration() {
    const configuration = await this.indexerService.getConfiguration();
    return {
      configuration,
      success: true,
    };
  }

  /**
   * `GET` requests to `/api/list-user-indexer-logs`
   * @returns
   */
  @ApiEndpoint(Get, 'list-user-indexer-logs', HttpStatus.OK, {
    summary: 'Indexer logs for all or specified users',
    description: [
      'Retrieves the most recent indexer logs based on any provided query parameters.',
      'Logs are held in memory and will clear whenever the server restarts.',
      'The oldest logs will discard as they accumulate beyond the capacity in the `system_configurations` table.',
    ].join(' '),
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: ListIndexerLogsWithUserResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListIndexerLogsWithUserQueryDto),
    },
  })
  async listIndexerLogs(@Query() query: ListIndexerLogsWithUserQueryDto) {
    const logs = await this.indexerService.listIndexerLogs(query.accountId, query.rootPathId, query.search);
    return {
      logs,
      success: true,
    };
  }

  /**
   * `GET` requests to `/api/indexer-logs`
   * @returns
   */
  @ApiEndpoint(Get, 'list-indexer-logs', HttpStatus.OK, {
    summary: 'Indexer logs for the authenticated user',
    description: [
      'Retrieves the most recent indexer logs based on any provided query parameters.',
      'Logs are held in memory and will clear whenever the server restarts.',
      'The oldest logs will discard as they accumulate beyond the capacity in the `system_configurations` table.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: ListIndexerLogsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListIndexerLogsQueryDto),
    },
  })
  async listIndexerLogsByUser(@User() user: AccountEntity, @Query() query: ListIndexerLogsQueryDto) {
    const logs = await this.indexerService.listIndexerLogsByUser(user.id, query.rootPathId, query.search);
    return {
      logs,
      success: true,
    };
  }

  /**
   * `PATCH` requests to `/api/set-indexer-status`
   * @returns
   */
  @ApiEndpoint(Patch, 'set-indexer-status', HttpStatus.OK, {
    summary: 'Set the indexer status',
    description: 'Enables or disables the indexer to allow moving root paths or to preserve system resources.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
    },
  })
  async setStatus(@User() user: AccountEntity, @Body() body: SetIndexerStatusBodyDto) {
    const { enabled } = body;
    await this.indexerService.setStatus(user.id, enabled);
    return { success: true };
  }
}
