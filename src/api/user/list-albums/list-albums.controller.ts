import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumsBadRequestResponseDto,
  UserListAlbumsQueryDto,
  UserListAlbumsResponseDto,
} from './list-albums.dto';
import { UserListAlbumsService } from './list-albums.service';

@UserController()
export class UserListAlbumsController {
  constructor(private readonly listAlbumsService: UserListAlbumsService) {}

  @ApiEndpoint(Get, 'list-albums', HttpStatus.OK, {
    summary: 'List albums',
    description: 'Albums can be filtered by an extensive set of criteria and search terms.',
    isAuthenticated: true,
    isFiltered: true,
    isPaginated: true,
    excludeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: UserListAlbumsResponseDto,
      [HttpStatus.BAD_REQUEST]: UserListAlbumsBadRequestResponseDto,
    },
  })
  async get(@User() user: AccountEntity, @Query() query: UserListAlbumsQueryDto): Promise<UserListAlbumsResponseDto> {
    const data = await this.listAlbumsService.listAlbums(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
