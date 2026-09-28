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
  UserListTrackAssociationsWithTracksBadRequestResponseDto,
  UserListTrackAssociationsWithTracksQueryDto,
  UserListTrackAssociationsWithTracksResponseDto,
} from './list-track-associations-with-tracks.dto';
import { UserListTrackAssociationsWithTracksService } from './list-track-associations-with-tracks.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackAssociationsWithTracksController {
  constructor(private readonly listTrackAssociationsWithTracksService: UserListTrackAssociationsWithTracksService) {}

  @Get('list-track-associations-with-tracks')
  @ApiOperation({
    summary: 'List track-associated artists, composers and genres and return tracks.',
    description: [
      `Track associations are artists, composers and genres attributed directly to individual tracks.`,
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
    type: UserListTrackAssociationsWithTracksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackAssociationsWithTracksBadRequestResponseDto,
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
