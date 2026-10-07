import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetAlbumFavoriteNotFoundResponseDto,
  UserSetAlbumFavoriteQueryDto,
  UserSetAlbumFavoriteResponseDto,
} from './set-album-favorite.dto';
import { UserSetAlbumFavoriteService } from './set-album-favorite.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetAlbumFavoriteController {
  constructor(private readonly setAlbumFavoriteService: UserSetAlbumFavoriteService) {}

  @Put('set-album-favorite')
  @ApiOperation({
    summary: `Mark an album as a favorite `,
    description: [
      `Favorites the specified album allowing easier access in the user's library.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Favorite set successfully',
    type: UserSetAlbumFavoriteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Favorite not found',
    type: UserSetAlbumFavoriteNotFoundResponseDto,
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetAlbumFavoriteQueryDto,
  ): Promise<UserSetAlbumFavoriteResponseDto> {
    await this.setAlbumFavoriteService.setAlbumFavorite(user.id, query.id);
    return {
      success: true,
    };
  }
}
