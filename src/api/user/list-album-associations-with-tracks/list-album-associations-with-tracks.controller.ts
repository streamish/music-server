import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumAssociationsWithTracksQueryDto,
  UserListAlbumAssociationsWithTracksResponseDto,
} from './list-album-associations-with-tracks.dto';
import { UserListAlbumAssociationsWithTracksService } from './list-album-associations-with-tracks.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserListAlbumAssociationsWithTracksController {
  constructor(private readonly listAlbumAssociationsWithTracksService: UserListAlbumAssociationsWithTracksService) {}

  @ApiEndpoint(Get, 'list-album-associations-with-tracks', HttpStatus.OK, {
    summary: 'List artists credited to albums and return album/track data',
    description:
      'Associations are artists attributed directly to an album and the composers and genres attributed to tracks.',
    isAuthenticated: true,
    isFiltered: true,
    includeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: UserListAlbumAssociationsWithTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserListAlbumAssociationsWithTracksQueryDto),
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListAlbumAssociationsWithTracksQueryDto,
  ): Promise<UserListAlbumAssociationsWithTracksResponseDto> {
    const data = await this.listAlbumAssociationsWithTracksService.listAssociationsWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
