import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminIndexerConfigurationResponseDto } from './indexer-configuration.dto';
import { AdminIndexerConfigurationService } from './indexer-configuration.service';
import { Get, HttpStatus } from '@nestjs/common';

@AdminController()
export class AdminIndexerConfigurationController {
  constructor(private readonly indexerConfigurationService: AdminIndexerConfigurationService) {}

  @ApiEndpoint(Get, 'indexer-configuration', HttpStatus.OK, {
    summary: 'Get the indexer configuration',
    description:
      'Retrieves the current indexer configuration for the platform.  This is currently limited to "on" or "off".',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminIndexerConfigurationResponseDto,
    },
  })
  async get(): Promise<AdminIndexerConfigurationResponseDto> {
    const configuration = await this.indexerConfigurationService.getIndexerConfiguration();
    return {
      configuration,
      success: true,
    };
  }
}
