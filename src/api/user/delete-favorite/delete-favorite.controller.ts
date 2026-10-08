import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Delete, HttpStatus, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { UserDeleteFavoriteQueryDto, UserDeleteFavoriteResponseDto } from './delete-favorite.dto';
import { UserDeleteFavoriteService } from './delete-favorite.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserDeleteFavoriteController {
  constructor(private readonly deleteFavoriteService: UserDeleteFavoriteService) {}

  @ApiEndpoint(Delete, 'delete-favorite', HttpStatus.OK, {
    summary: `Remove a favorite from the user's account`,
    description: [
      `Deletes the specified favorite immediately.`,
      `The album, association or track will no longer be a favorite but will still exist in the user's library.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserDeleteFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.FAVORITE_ITEM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserDeleteFavoriteQueryDto),
    },
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
