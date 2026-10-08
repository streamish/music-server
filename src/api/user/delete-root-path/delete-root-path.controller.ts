import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Delete, HttpStatus, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { UserDeleteRootPathQueryDto, UserDeleteRootPathResponseDto } from './delete-root-path.dto';
import { UserDeleteRootPathService } from './delete-root-path.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserDeleteRootPathController {
  constructor(private readonly deleteRootPathService: UserDeleteRootPathService) {}

  @ApiEndpoint(Delete, 'delete-root-path', HttpStatus.OK, {
    summary: `Remove a music source from the user's account`,
    description: [
      `Deletes the specified root path and all associated information in the database immediately.`,
      `The songs and folders will no longer be present in your library but the files will remain on the file system.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserDeleteRootPathResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserDeleteRootPathQueryDto),
    },
  })
  async delete(
    @User() user: AccountEntity,
    @Query() query: UserDeleteRootPathQueryDto,
  ): Promise<UserDeleteRootPathResponseDto> {
    await this.deleteRootPathService.delete(user.id, query.id);
    return {
      success: true,
    };
  }
}
