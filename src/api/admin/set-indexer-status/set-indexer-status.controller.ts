import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminSetIndexerStatusBodyDto, AdminSetIndexerStatusResponseDto } from './set-indexer-status.dto';
import { AdminSetIndexerStatusService } from './set-indexer-status.service';
import { Body, HttpStatus, Patch } from '@nestjs/common';
import { User } from 'src/api/user.decorator';

@AdminController()
export class AdminSetIndexerStatusController {
  constructor(private readonly setIndexerStatusService: AdminSetIndexerStatusService) {}

  @ApiEndpoint(Patch, 'set-indexer-status', HttpStatus.OK, {
    summary: 'Set the indexer status',
    description: 'Enables or disables the indexer to allow moving root paths or to preserve system resources.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminSetIndexerStatusResponseDto,
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Body() body: AdminSetIndexerStatusBodyDto,
  ): Promise<AdminSetIndexerStatusResponseDto> {
    const { enabled } = body;
    await this.setIndexerStatusService.setScannerStatus(user.id, enabled);
    return { success: true };
  }
}
