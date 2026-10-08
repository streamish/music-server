import { AdminController, ApiEndpoint } from 'src/api/api.decorator';
import {
  AdminUpdateRootPathBadRequestResponseDto,
  AdminUpdateRootPathBodyDto,
  AdminUpdateRootPathNotFoundResponseDto,
  AdminUpdateRootPathQueryDto,
  AdminUpdateRootPathResponseDto,
} from './update-root-path.dto';
import { AdminUpdateRootPathService } from './update-root-path.service';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';

@AdminController()
export class AdminUpdateRootPathController {
  constructor(private readonly updateRootPathService: AdminUpdateRootPathService) {}

  @ApiEndpoint(Patch, 'update-root-path', HttpStatus.OK, {
    summary: 'Update a root path',
    description: 'Updates the specified root path with a new path.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminUpdateRootPathResponseDto,
      [HttpStatus.BAD_REQUEST]: AdminUpdateRootPathBadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: AdminUpdateRootPathNotFoundResponseDto,
    },
  })
  async patch(
    @Query() query: AdminUpdateRootPathQueryDto,
    @Body() body: AdminUpdateRootPathBodyDto,
  ): Promise<AdminUpdateRootPathResponseDto> {
    await this.updateRootPathService.updateRootPath(query.id, body.newPath);
    return {
      success: true,
    };
  }
}
