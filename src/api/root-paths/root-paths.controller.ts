import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from '../api.decorator';
import { ApiRootPathsService } from './root-paths.service';
import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import {
  CreateRootPathBodyDto,
  CreateRootPathQueryDto,
  DeleteRootPathQueryDto,
  RootPathsResponseDto,
  RootPathsWithUserResponseDto,
  UpdateRootPathBodyDto,
  UpdateRootPathQueryDto,
  UserRootPathQueryDto,
} from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from '../user.decorator';

@Controller('/api')
export class ApiRootPathsController {
  constructor(private readonly rootPathsService: ApiRootPathsService) {}

  /**
   * `POST` request to `/api/create-user-root-path`
   * @param query
   * @param body
   * @returns
   */
  @ApiEndpoint(Post, 'create-user-root-path', HttpStatus.CREATED, {
    summary: 'Add new root path to account',
    description: [
      'Add a library root path to the specified account.',
      'This will add media in the path when the indexer reaches it.',
      'This folder must exist and be accessible, allowing any music it contains to be indexed.',
    ].join(' '),
    allowAdministrator: true,
    responses: {
      [HttpStatus.CREATED]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR, ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
        ErrorCodes.DUPLICATE_ROOT_PATH_ERROR,
        ...getValidationMessages(CreateRootPathQueryDto),
        ...getValidationMessages(CreateRootPathBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
    },
  })
  async createRootPath(
    @Query() query: CreateRootPathQueryDto,
    @Body() body: CreateRootPathBodyDto,
  ): Promise<SuccessResponseDto> {
    await this.rootPathsService.createRootPath(query.id, body.rootPath);
    return {
      success: true,
    };
  }

  /**
   * `POST` request to `/api/create-root-path`
   * @param query
   * @param body
   * @returns
   */
  @ApiEndpoint(Post, 'create-root-path', HttpStatus.CREATED, {
    summary: 'Add a new source of music to the user account',
    description: [
      'Add a library root path to the authenticated account.',
      'This will add media in the path when the indexer reaches it.',
      'This folder must exist and be accessible, allowing any music it contains to be indexed.',
    ].join(' '),
    allowUser: true,
    allowAdministrator: true,
    responses: {
      [HttpStatus.CREATED]: SuccessResponseDto,
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
        ErrorCodes.DUPLICATE_ROOT_PATH_ERROR,
        ...getValidationMessages(CreateRootPathBodyDto),
      ],
    },
  })
  async post(@User() user: AccountEntity, @Body() body: CreateRootPathBodyDto): Promise<SuccessResponseDto> {
    await this.rootPathsService.createRootPath(user.id, body.rootPath);
    return {
      success: true,
    };
  }

  /**
   * `DELETE` request to `/api/delete-user-root-path`
   */
  @ApiEndpoint(Delete, 'delete-user-root-path', HttpStatus.OK, {
    summary: 'Delete a root path',
    description: 'Deletes the specified root path for a user and any media information in the database.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: getValidationMessages(DeleteRootPathQueryDto),
    },
  })
  async deleteUserRootPath(@Query() query: DeleteRootPathQueryDto): Promise<SuccessResponseDto> {
    await this.rootPathsService.deleteUserRootPath(query.id);
    return {
      success: true,
    };
  }

  /**
   * `DELETE` request to `/api/delete-root-path`
   */
  @ApiEndpoint(Delete, 'delete-root-path', HttpStatus.OK, {
    summary: 'Delete a root path',
    description:
      'Deletes the specified root path for the authenticated user and any media information in the database.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: getValidationMessages(DeleteRootPathQueryDto),
    },
  })
  async deleteRootPath(
    @User() user: AccountEntity,
    @Query() query: DeleteRootPathQueryDto,
  ): Promise<SuccessResponseDto> {
    await this.rootPathsService.deleteRootPath(user.id, query.id);
    return {
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-root-paths`
   * @returns
   */
  @ApiEndpoint(Get, 'list-root-paths', HttpStatus.OK, {
    summary: 'List all root paths of the authenticated user',
    description: [
      'Retrieves a list of all root paths for all user accounts, eg `/home/<username>/music`.',
      'These paths are indexed periodically or when files are changed to build the music library.',
      'The indexer works from a single queue so the more root paths the longer the delay between scanning.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: RootPathsResponseDto,
    },
  })
  async listRootPaths(@User() user: AccountEntity): Promise<RootPathsResponseDto> {
    const rootPaths = await this.rootPathsService.listRootPaths(user.id);
    return {
      success: true,
      rootPaths,
    };
  }

  @ApiEndpoint(Get, 'list-user-root-paths', HttpStatus.OK, {
    summary: 'List all root paths for all or specific users',
    description: [
      `Retrieves a list of all root paths optionally associated with a user, eg \`/home/<username>/music\`.',
      'These paths are indexed periodically or when files are changed to build the music library.`,
      'The indexer works from a single queue so the more root paths the longer the delay between scanning.',
    ].join(' '),
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: RootPathsWithUserResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR, ...getValidationMessages(UserRootPathQueryDto)],
    },
  })
  async listUserRootPaths(@Query() query: UserRootPathQueryDto): Promise<RootPathsWithUserResponseDto> {
    const rootPaths = await this.rootPathsService.listUserRootPaths(query.id);
    return {
      rootPaths,
      success: true,
    };
  }

  /**
   * `PATCH` request to `/api/update-root-path`
   */
  @ApiEndpoint(Patch, 'update-root-path', HttpStatus.OK, {
    summary: 'Update a root path',
    description: 'Updates the specified root path with a new path.',
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR,
        ...getValidationMessages(UpdateRootPathQueryDto),
        ...getValidationMessages(UpdateRootPathBodyDto),
      ],
    },
  })
  async patch(
    @Query() query: UpdateRootPathQueryDto,
    @Body() body: UpdateRootPathBodyDto,
  ): Promise<SuccessResponseDto> {
    await this.rootPathsService.updateRootPath(query.id, body.newPath);
    return {
      success: true,
    };
  }
}
