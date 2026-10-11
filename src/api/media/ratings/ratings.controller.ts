import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiRatingsService } from './ratings.service';
import { Body, Controller, HttpStatus, Put, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { SetAlbumRatingBodyDto, SetAlbumRatingQueryDto, SetTrackRatingBodyDto, SetTrackRatingQueryDto } from './dtos';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiRatingsController {
  constructor(private readonly ratingsService: ApiRatingsService) {}

  @ApiEndpoint(Put, 'set-album-rating', HttpStatus.OK, {
    summary: `Sets or unsets ratings for an album`,
    description: [
      'Sets or unsets a 1-5 star rating for the tracks within an album.',
      'If a value of 0 is specified the album rating is reset to `NULL`.',
      'Album ratings are applied to each track within the album, overriding any prior value.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(SetAlbumRatingQueryDto),
        ...getValidationMessages(SetAlbumRatingBodyDto),
      ],
    },
  })
  async setAlbumRating(
    @User() user: AccountEntity,
    @Query() query: SetAlbumRatingQueryDto,
    @Body() body: SetAlbumRatingBodyDto,
  ) {
    await this.ratingsService.setAlbumRating(user.id, query.id, body.rating);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Put, 'set-track-rating', HttpStatus.OK, {
    summary: `Sets or unsets rating for a track`,
    description: [
      'Sets or unsets a 1-5 star rating for a single track.',
      'If a value of 0 is specified the track rating is reset to `NULL`.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR, ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(SetTrackRatingQueryDto),
        ...getValidationMessages(SetTrackRatingBodyDto),
      ],
    },
  })
  async put(@User() user: AccountEntity, @Query() query: SetTrackRatingQueryDto, @Body() body: SetTrackRatingBodyDto) {
    await this.ratingsService.setTrackRating(user.id, query.id, body.rating);
    return {
      success: true,
    };
  }
}
