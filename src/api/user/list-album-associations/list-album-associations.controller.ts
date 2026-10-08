import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserListAlbumAssociationsQueryDto, UserListAlbumAssociationsResponseDto } from './list-album-associations.dto';
import { UserListAlbumAssociationsService } from './list-album-associations.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserListAlbumAssociationsController {
  constructor(private readonly listAlbumAssociationsService: UserListAlbumAssociationsService) {}

  @ApiEndpoint(Get, 'list-album-associations', HttpStatus.OK, {
    summary: 'List associations credited to albums',
    description:
      'Associations are artists attributed directly to an album and the composers and genres attributed to tracks.',
    isAuthenticated: true,
    isPaginated: true,
    isFiltered: true,
    excludeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: UserListAlbumAssociationsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserListAlbumAssociationsQueryDto),
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListAlbumAssociationsQueryDto,
  ): Promise<UserListAlbumAssociationsResponseDto> {
    const data = await this.listAlbumAssociationsService.listAssociations(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
