import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetAlbumRatingBadRequestResponseDto,
  UserSetAlbumRatingBodyDto,
  UserSetAlbumRatingNotFoundResponseDto,
  UserSetAlbumRatingQueryDto,
  UserSetAlbumRatingResponseDto,
} from './set-album-rating.dto';
import { UserSetAlbumRatingService } from './set-album-rating.service';

@UserController()
export class UserSetAlbumRatingController {
  constructor(private readonly setRatingService: UserSetAlbumRatingService) {}

  @ApiEndpoint(Put, 'set-album-rating', HttpStatus.OK, {
    summary: `Sets or unsets ratings for an album`,
    description: [`Sets or unsets a 1-5 star rating for the tracks within an album.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetAlbumRatingResponseDto,
      [HttpStatus.NOT_FOUND]: UserSetAlbumRatingNotFoundResponseDto,
      [HttpStatus.BAD_REQUEST]: UserSetAlbumRatingBadRequestResponseDto,
    },
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetAlbumRatingQueryDto,
    @Body() body: UserSetAlbumRatingBodyDto,
  ) {
    await this.setRatingService.setRating(user.id, query.id, body.rating);
    return {
      success: true,
    };
  }
}
