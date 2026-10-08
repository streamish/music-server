import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminListRootPathsResponseDto } from './list-root-paths.dto';
import { AdminListRootPathsService } from './list-root-paths.service';
import { Get, HttpStatus } from '@nestjs/common';

@AdminController()
export class AdminListRootPathsController {
  constructor(private readonly listRootPathsService: AdminListRootPathsService) {}

  @ApiEndpoint(Get, 'list-root-paths', HttpStatus.OK, {
    summary: 'List all sources of music for all users',
    description: [
      'Retrieves a list of all root paths for all user accounts, eg `/home/<username>/music`.',
      'These paths are indexed periodically or when files are changed to build the music library.',
      'The indexer works from a single queue so the more root paths the longer the delay between scanning.',
    ].join(' '),
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminListRootPathsResponseDto,
    },
  })
  async get(): Promise<AdminListRootPathsResponseDto> {
    const rootPaths = await this.listRootPathsService.listRootPaths();
    return {
      rootPaths,
      success: true,
    };
  }
}
