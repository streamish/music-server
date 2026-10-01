import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  FILTERED_DATA_DESCRIPTION,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
  PAGINATED_DATA_DESCRIPTION,
  TRACK_INFORMATION_INCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumAssociationsWithTracksBadRequestResponseDto,
  UserListAlbumAssociationsWithTracksQueryDto,
  UserListAlbumAssociationsWithTracksResponseDto,
} from './list-album-associations-with-tracks.dto';
import { UserListAlbumAssociationsWithTracksService } from './list-album-associations-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListAlbumAssociationsWithTracksController {
  constructor(private readonly listAlbumAssociationsWithTracksService: UserListAlbumAssociationsWithTracksService) {}

  @Get('list-album-associations-with-tracks')
  @ApiOperation({
    summary: 'List artists credited to albums and return album/track data',
    description: [
      `Associations are artists attributed directly to an album and the composers and genres attributed to tracks.`,
      FILTERED_DATA_DESCRIPTION,
      TRACK_INFORMATION_INCLUDED,
      PAGINATED_DATA_DESCRIPTION,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListAlbumAssociationsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListAlbumAssociationsWithTracksBadRequestResponseDto,
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
