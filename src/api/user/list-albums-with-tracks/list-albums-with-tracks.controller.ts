import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumsWithTracksBadRequestResponseDto,
  UserListAlbumsWithTracksQueryDto,
  UserListAlbumsWithTracksResponseDto,
} from './list-albums-with-tracks.dto';
import { UserListAlbumsWithTracksService } from './list-albums-with-tracks.service';

@UserController()
export class UserListAlbumsWithTracksController {
  constructor(private readonly listAlbumsWithTracksService: UserListAlbumsWithTracksService) {}

  @ApiEndpoint(Get, 'list-albums-with-tracks', HttpStatus.OK, {
    summary: 'List albums and include their track data',
    description: 'Albums can be filtered by an extensive set of criteria and search terms.',
    isAuthenticated: true,
    isFiltered: true,
    isPaginated: true,
    includeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: UserListAlbumsWithTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: UserListAlbumsWithTracksBadRequestResponseDto,
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListAlbumsWithTracksQueryDto,
  ): Promise<UserListAlbumsWithTracksResponseDto> {
    const data = await this.listAlbumsWithTracksService.listAlbumsWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
