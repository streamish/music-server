import { AccountEntity } from 'src/database/entities/account.entity';
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
import { Body, Controller, Patch, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetAlbumCustomDataBadRequestResponseDto,
  UserSetAlbumCustomDataBodyDto,
  UserSetAlbumCustomDataNotFoundResponseDto,
  UserSetAlbumCustomDataQueryDto,
  UserSetAlbumCustomDataResponseDto,
} from './set-album-custom-data.dto';
import { UserSetAlbumCustomDataService } from './set-album-custom-data.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetAlbumCustomDataController {
  constructor(private readonly setAlbumCustomDataService: UserSetAlbumCustomDataService) {}

  @Patch('set-album-custom-data')
  @ApiOperation({
    summary: `Set custom data for an album in the user's account`,
    description: [
      `Assigns custom data to an album, overriding the embedded data within its tracks.`,
      `This affects all tracks within the album.`,
      `The next indexing pass of the album will reflect the newly set custom data.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Custom data set successfully',
    type: UserSetAlbumCustomDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserSetAlbumCustomDataNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetAlbumCustomDataBadRequestResponseDto,
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: UserSetAlbumCustomDataQueryDto,
    @Body() body: UserSetAlbumCustomDataBodyDto,
  ) {
    await this.setAlbumCustomDataService.setAlbumData(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
