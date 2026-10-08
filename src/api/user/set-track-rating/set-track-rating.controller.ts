import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Put, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import {
  UserSetTrackRatingBodyDto,
  UserSetTrackRatingQueryDto,
  UserSetTrackRatingResponseDto,
} from './set-track-rating.dto';
import { UserSetTrackRatingService } from './set-track-rating.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserSetTrackRatingController {
  constructor(private readonly setRatingService: UserSetTrackRatingService) {}

  @ApiEndpoint(Put, 'set-track-rating', HttpStatus.OK, {
    summary: `Sets or unsets rating for a track`,
    description: [`Sets or unsets a 1-5 star rating for a single track.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetTrackRatingResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR, ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(UserSetTrackRatingQueryDto),
        ...getValidationMessages(UserSetTrackRatingBodyDto),
      ],
    },
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetTrackRatingQueryDto,
    @Body() body: UserSetTrackRatingBodyDto,
  ) {
    await this.setRatingService.setRating(user.id, query.id, body.rating);
    return {
      success: true,
    };
  }
}
