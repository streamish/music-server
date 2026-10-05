import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetAlbumRatingBadRequestResponseDto,
  UserSetAlbumRatingBodyDto,
  UserSetAlbumRatingNotFoundResponseDto,
  UserSetAlbumRatingQueryDto,
  UserSetAlbumRatingResponseDto,
} from './set-album-rating.dto';
import { UserSetAlbumRatingService } from './set-album-rating.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetAlbumRatingController {
  constructor(private readonly setRatingService: UserSetAlbumRatingService) {}

  @Put('set-album-rating')
  @ApiOperation({
    summary: `Sets or unsets ratings for an album`,
    description: [
      `Sets or unsets a 1-5 star rating for the tracks within an album.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Rating set successfully',
    type: UserSetAlbumRatingResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Track or album not found',
    type: UserSetAlbumRatingNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetAlbumRatingBadRequestResponseDto,
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetAlbumRatingQueryDto,
    @Body() body: UserSetAlbumRatingBodyDto,
  ) {
    console.log('Setting rating for user:', user, 'with body:', body, 'and query:', query);
    await this.setRatingService.setRating(user.id, query.id, body.rating);
    return {
      success: true,
    };
  }
}
