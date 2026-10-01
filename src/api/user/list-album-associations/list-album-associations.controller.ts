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
  TRACK_INFORMATION_EXCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListAlbumAssociationsBadRequestResponseDto,
  UserListAlbumAssociationsQueryDto,
  UserListAlbumAssociationsResponseDto,
} from './list-album-associations.dto';
import { UserListAlbumAssociationsService } from './list-album-associations.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListAlbumAssociationsController {
  constructor(private readonly listAlbumAssociationsService: UserListAlbumAssociationsService) {}

  @Get('list-album-associations')
  @ApiOperation({
    summary: 'List associations credited to albums',
    description: [
      `Associations are artists attributed directly to an album and the composers and genres attributed to tracks.`,
      FILTERED_DATA_DESCRIPTION,
      TRACK_INFORMATION_EXCLUDED,
      PAGINATED_DATA_DESCRIPTION,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListAlbumAssociationsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListAlbumAssociationsBadRequestResponseDto,
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
