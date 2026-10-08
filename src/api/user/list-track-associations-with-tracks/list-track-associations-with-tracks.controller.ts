import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserListTrackAssociationsWithTracksBadRequestResponseDto,
  UserListTrackAssociationsWithTracksQueryDto,
  UserListTrackAssociationsWithTracksResponseDto,
} from './list-track-associations-with-tracks.dto';
import { UserListTrackAssociationsWithTracksService } from './list-track-associations-with-tracks.service';

@UserController()
export class UserListTrackAssociationsWithTracksController {
  constructor(private readonly listTrackAssociationsWithTracksService: UserListTrackAssociationsWithTracksService) {}

  @ApiEndpoint(Get, 'list-track-associations-with-tracks', HttpStatus.OK, {
    summary: 'List track-associated artists, composers and genres and return tracks.',
    description: 'Track associations are artists, composers and genres attributed directly to individual tracks.',
    isAuthenticated: true,
    isFiltered: true,
    isPaginated: true,
    includeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: UserListTrackAssociationsWithTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: UserListTrackAssociationsWithTracksBadRequestResponseDto,
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackAssociationsWithTracksQueryDto,
  ): Promise<UserListTrackAssociationsWithTracksResponseDto> {
    const data = await this.listTrackAssociationsWithTracksService.listAssociationsWithTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
