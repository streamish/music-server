import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Post } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserCreateRootPathBadRequestResponseDto,
  UserCreateRootPathBodyDto,
  UserCreateRootPathResponseDto,
} from './create-root-path.dto';
import { UserCreateRootPathService } from './create-root-path.service';

@UserController()
export class UserCreateRootPathController {
  constructor(private readonly createRootPathService: UserCreateRootPathService) {}

  @ApiEndpoint(Post, 'create-root-path', HttpStatus.CREATED, {
    summary: 'Add a new source of music to the user account',
    description: [
      `Adds a new root path to the user's account.`,
      'This folder must exist and be accessible, allowing any music it contains to be indexed.',
    ].join(' '),
    responses: {
      [HttpStatus.CREATED]: UserCreateRootPathResponseDto,
      [HttpStatus.BAD_REQUEST]: UserCreateRootPathBadRequestResponseDto,
    },
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: UserCreateRootPathBodyDto,
  ): Promise<UserCreateRootPathResponseDto> {
    await this.createRootPathService.createRootPath(user.id, body.rootPath);
    return {
      success: true,
    };
  }
}
