import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminCreateRootPathBadRequestResponseDto,
  AdminCreateRootPathBodyDto,
  AdminCreateRootPathNotFoundResponseDto,
  AdminCreateRootPathQueryDto,
  AdminCreateRootPathResponseDto,
} from './create-root-path.dto';
import { AdminCreateRootPathService } from './create-root-path.service';
import { Body, HttpStatus, Post, Query } from '@nestjs/common';

@AdminController()
export class AdminCreateRootPathController {
  constructor(private readonly createRootPathService: AdminCreateRootPathService) {}

  @ApiEndpoint(Post, 'create-root-path', HttpStatus.CREATED, {
    summary: 'Add new root path to account',
    description: 'Add a library root path to an account. This will add media in the path when the indexer reaches it.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.CREATED]: AdminCreateRootPathResponseDto,
      [HttpStatus.BAD_REQUEST]: AdminCreateRootPathBadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: AdminCreateRootPathNotFoundResponseDto,
    },
  })
  async post(
    @Query() query: AdminCreateRootPathQueryDto,
    @Body() body: AdminCreateRootPathBodyDto,
  ): Promise<AdminCreateRootPathResponseDto> {
    await this.createRootPathService.createRootPath(query.id, body.rootPath);
    return {
      success: true,
    };
  }
}
