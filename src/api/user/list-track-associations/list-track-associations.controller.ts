import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  FILTERED_DATA_DESCRIPTION,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_BEARER_AUTH,
  PAGINATED_DATA_DESCRIPTION,
  TRACK_INFORMATION_EXCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListTrackAssociationsBadRequestResponseDto,
  UserListTrackAssociationsQueryDto,
  UserListTrackAssociationsResponseDto,
} from './list-track-associations.dto';
import { UserListTrackAssociationsService } from './list-track-associations.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListTrackAssociationsController {
  constructor(private readonly listTrackAssociationsService: UserListTrackAssociationsService) {}

  @Get('list-track-associations')
  @ApiOperation({
    summary: 'List track-associated artists, composers and genres',
    description: [
      `Track associations are artists, composers and genres attributed directly to individual tracks.`,
      FILTERED_DATA_DESCRIPTION,
      TRACK_INFORMATION_EXCLUDED,
      PAGINATED_DATA_DESCRIPTION,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListTrackAssociationsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListTrackAssociationsBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackAssociationsQueryDto,
  ): Promise<UserListTrackAssociationsResponseDto> {
    const data = await this.listTrackAssociationsService.listAssociations(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
