import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetAssociationFavoriteNotFoundResponseDto,
  UserSetAssociationFavoriteQueryDto,
  UserSetAssociationFavoriteResponseDto,
} from './set-association-favorite.dto';
import { UserSetAssociationFavoriteService } from './set-association-favorite.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetAssociationFavoriteController {
  constructor(private readonly setAssociationFavoriteService: UserSetAssociationFavoriteService) {}

  @Put('set-association-favorite')
  @ApiOperation({
    summary: `Mark an association as a favorite`,
    description: [
      `Favorites an associated artist, composer or genre allowing easier access in the user's library.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Favorite set successfully',
    type: UserSetAssociationFavoriteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Favorite not found',
    type: UserSetAssociationFavoriteNotFoundResponseDto,
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetAssociationFavoriteQueryDto,
  ): Promise<UserSetAssociationFavoriteResponseDto> {
    await this.setAssociationFavoriteService.setAssociationFavorite(user.id, query.id, query.associationType);
    return {
      success: true,
    };
  }
}
