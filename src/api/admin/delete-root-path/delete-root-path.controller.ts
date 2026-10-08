import { AdminController, ApiEndpoint } from '../../api.decorator';
import { AdminDeleteRootPathQueryDto, AdminDeleteRootPathResponseDto } from './delete-root-path.dto';
import { AdminDeleteRootPathService } from './delete-root-path.service';
import { Delete, HttpStatus, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';

@AdminController()
export class AdminDeleteRootPathController {
  constructor(private readonly deleteRootPathService: AdminDeleteRootPathService) {}

  @ApiEndpoint(Delete, 'delete-root-path', HttpStatus.OK, {
    summary: 'Delete a root path',
    description:
      'Deletes the specified root path for a user and immediately deletes all associated information in the database.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminDeleteRootPathResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR],
    },
  })
  async delete(@Query() query: AdminDeleteRootPathQueryDto): Promise<AdminDeleteRootPathResponseDto> {
    await this.deleteRootPathService.delete(query.id);
    return {
      success: true,
    };
  }
}
