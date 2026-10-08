import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_BEARER_AUTH, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetTrackRatingBadRequestResponseDto,
  UserSetTrackRatingBodyDto,
  UserSetTrackRatingNotFoundResponseDto,
  UserSetTrackRatingQueryDto,
  UserSetTrackRatingResponseDto,
} from './set-track-rating.dto';
import { UserSetTrackRatingService } from './set-track-rating.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetTrackRatingController {
  constructor(private readonly setRatingService: UserSetTrackRatingService) {}

  @Put('set-track-rating')
  @ApiOperation({
    summary: `Sets or unsets rating for a track`,
    description: [`Sets or unsets a 1-5 star rating for a single track.`, JWT_AUTHENTICATED_REQUEST_DESCRIPTION].join(
      '\n',
    ),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Rating set successfully',
    type: UserSetTrackRatingResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Track or album not found',
    type: UserSetTrackRatingNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetTrackRatingBadRequestResponseDto,
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
