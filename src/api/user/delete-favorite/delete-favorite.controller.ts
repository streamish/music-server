import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_BEARER_AUTH, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserDeleteFavoriteNotFoundResponseDto,
  UserDeleteFavoriteQueryDto,
  UserDeleteFavoriteResponseDto,
} from './delete-favorite.dto';
import { UserDeleteFavoriteService } from './delete-favorite.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserDeleteFavoriteController {
  constructor(private readonly deleteFavoriteService: UserDeleteFavoriteService) {}

  @Delete('delete-favorite')
  @ApiOperation({
    summary: `Remove a favorite from the user's account`,
    description: [
      `Deletes the specified favorite immediately.`,
      `The album, association or track will no longer be a favorite but will still exist in the user's library.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Favorite deleted successfully',
    type: UserDeleteFavoriteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Favorite not found',
    type: UserDeleteFavoriteNotFoundResponseDto,
  })
  async delete(
    @User() user: AccountEntity,
    @Query() query: UserDeleteFavoriteQueryDto,
  ): Promise<UserDeleteFavoriteResponseDto> {
    await this.deleteFavoriteService.deleteFavorite(user.id, query.id);
    return {
      success: true,
    };
  }
}
