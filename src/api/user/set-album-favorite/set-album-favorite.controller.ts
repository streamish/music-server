import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserSetAlbumFavoriteQueryDto, UserSetAlbumFavoriteResponseDto } from './set-album-favorite.dto';
import { UserSetAlbumFavoriteService } from './set-album-favorite.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserSetAlbumFavoriteController {
  constructor(private readonly setAlbumFavoriteService: UserSetAlbumFavoriteService) {}

  @ApiEndpoint(Put, 'set-album-favorite', HttpStatus.OK, {
    summary: `Mark an album as a favorite `,
    description: [`Favorites the specified album allowing easier access in the user's library.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetAlbumFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserSetAlbumFavoriteQueryDto),
    },
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
