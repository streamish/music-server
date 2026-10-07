import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetTrackFavoriteNotFoundResponseDto,
  UserSetTrackFavoriteQueryDto,
  UserSetTrackFavoriteResponseDto,
} from './set-track-favorite.dto';
import { UserSetTrackFavoriteService } from './set-track-favorite.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetTrackFavoriteController {
  constructor(private readonly setTrackFavoriteService: UserSetTrackFavoriteService) {}

  @Put('set-track-favorite')
  @ApiOperation({
    summary: `Mark a track as a favorite `,
    description: [
      `Favorites the specified track allowing easier access in the user's library.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Favorite set successfully',
    type: UserSetTrackFavoriteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Favorite not found',
    type: UserSetTrackFavoriteNotFoundResponseDto,
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetTrackFavoriteQueryDto,
  ): Promise<UserSetTrackFavoriteResponseDto> {
    await this.setTrackFavoriteService.setTrackFavorite(user.id, query.id);
    return {
      success: true,
    };
  }
}
