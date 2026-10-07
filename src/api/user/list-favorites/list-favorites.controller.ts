import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
  PAGINATED_DATA_DESCRIPTION,
  USER_APIS,
} from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListFavoritesBadRequestResponseDto,
  UserListFavoritesQueryDto,
  UserListFavoritesResponseDto,
} from './list-favorites.dto';
import { UserListFavoritesService } from './list-favorites.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListFavoritesController {
  constructor(private readonly listFavoritesService: UserListFavoritesService) {}

  @Get('list-favorites')
  @ApiOperation({
    summary: 'List favorites',
    description: [
      `Favorites can be albums, tracks, folders, or an associated artist, composer or genre.`,
      PAGINATED_DATA_DESCRIPTION,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListFavoritesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Failure response with error information relating to missing or invalid parameters.',
    type: UserListFavoritesBadRequestResponseDto,
  })
  async get(@User() user: AccountEntity, @Query() query: UserListFavoritesQueryDto) {
    const data = await this.listFavoritesService.listFavorites(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
