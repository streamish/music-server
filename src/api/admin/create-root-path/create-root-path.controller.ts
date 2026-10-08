import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminCreateRootPathBodyDto,
  AdminCreateRootPathQueryDto,
  AdminCreateRootPathResponseDto,
} from './create-root-path.dto';
import { AdminCreateRootPathService } from './create-root-path.service';
import { Body, HttpStatus, Post, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { getValidationMessages } from 'src/api/response.dto';

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
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR, ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
        ErrorCodes.DUPLICATE_ROOT_PATH_ERROR,
        ...getValidationMessages(AdminCreateRootPathQueryDto),
        ...getValidationMessages(AdminCreateRootPathBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
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
