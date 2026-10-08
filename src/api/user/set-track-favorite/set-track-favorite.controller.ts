import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserSetTrackFavoriteQueryDto, UserSetTrackFavoriteResponseDto } from './set-track-favorite.dto';
import { UserSetTrackFavoriteService } from './set-track-favorite.service';

@UserController()
export class UserSetTrackFavoriteController {
  constructor(private readonly setTrackFavoriteService: UserSetTrackFavoriteService) {}

  @ApiEndpoint(Put, 'set-track-favorite', HttpStatus.OK, {
    summary: `Mark a track as a favorite `,
    description: [`Favorites the specified track allowing easier access in the user's library.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetTrackFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
    },
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
