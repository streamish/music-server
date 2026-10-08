import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Put, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import {
  UserSetAlbumRatingBodyDto,
  UserSetAlbumRatingQueryDto,
  UserSetAlbumRatingResponseDto,
} from './set-album-rating.dto';
import { UserSetAlbumRatingService } from './set-album-rating.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserSetAlbumRatingController {
  constructor(private readonly setRatingService: UserSetAlbumRatingService) {}

  @ApiEndpoint(Put, 'set-album-rating', HttpStatus.OK, {
    summary: `Sets or unsets ratings for an album`,
    description: [`Sets or unsets a 1-5 star rating for the tracks within an album.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetAlbumRatingResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(UserSetAlbumRatingQueryDto),
        ...getValidationMessages(UserSetAlbumRatingBodyDto),
      ],
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
