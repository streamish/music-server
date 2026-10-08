import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserListRootPathsResponseDto } from './list-root-paths.dto';
import { UserListRootPathsService } from './list-root-paths.service';

@UserController()
export class UserListRootPathsController {
  constructor(private readonly listRootPathsService: UserListRootPathsService) {}

  @ApiEndpoint(Get, 'list-root-paths', HttpStatus.OK, {
    summary: `List all sources of music for the user's account`,
    description: [
      `Retrieves a list of all root paths associated with the user's account, eg \`/home/<username>/music\`.',
      'These paths are indexed periodically or when files are changed to build the music library.`,
      'The indexer works from a single queue so the more root paths the longer the delay between scanning.',
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserListRootPathsResponseDto,
    },
  })
  async get(@User() user: AccountEntity): Promise<UserListRootPathsResponseDto> {
    const rootPaths = await this.listRootPathsService.listRootPaths(user.id);
    return {
      rootPaths,
      success: true,
    };
  }
}
