import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetTrackRatingBadRequestResponseDto,
  UserSetTrackRatingBodyDto,
  UserSetTrackRatingNotFoundResponseDto,
  UserSetTrackRatingQueryDto,
  UserSetTrackRatingResponseDto,
} from './set-track-rating.dto';
import { UserSetTrackRatingService } from './set-track-rating.service';

@UserController()
export class UserSetTrackRatingController {
  constructor(private readonly setRatingService: UserSetTrackRatingService) {}

  @ApiEndpoint(Put, 'set-track-rating', HttpStatus.OK, {
    summary: `Sets or unsets rating for a track`,
    description: [`Sets or unsets a 1-5 star rating for a single track.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetTrackRatingResponseDto,
      [HttpStatus.NOT_FOUND]: UserSetTrackRatingNotFoundResponseDto,
      [HttpStatus.BAD_REQUEST]: UserSetTrackRatingBadRequestResponseDto,
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
