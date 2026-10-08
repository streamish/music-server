import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_BEARER_AUTH, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetFolderFavoriteNotFoundResponseDto,
  UserSetFolderFavoriteQueryDto,
  UserSetFolderFavoriteResponseDto,
} from './set-folder-favorite.dto';
import { UserSetFolderFavoriteService } from './set-folder-favorite.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetFolderFavoriteController {
  constructor(private readonly setFolderFavoriteService: UserSetFolderFavoriteService) {}

  @Put('set-folder-favorite')
  @ApiOperation({
    summary: `Mark a folder as a favorite `,
    description: [
      `Favorites the specified folder allowing easier access in the user's library.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Favorite set successfully',
    type: UserSetFolderFavoriteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Favorite not found',
    type: UserSetFolderFavoriteNotFoundResponseDto,
  })
  async put(@User() user: AccountEntity, @Query() query: UserSetFolderFavoriteQueryDto) {
    await this.setFolderFavoriteService.setFolderFavorite(user.id, query.folder);
    return {
      success: true,
    };
  }
}
