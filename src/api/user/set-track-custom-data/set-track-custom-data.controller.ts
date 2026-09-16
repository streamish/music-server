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
import { Body, Controller, Patch, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetCustomFileDataBadRequestResponseDto,
  UserSetCustomFileDataNotFoundResponseDto,
  UserSetCustomFileDataResponseDto,
} from '../set-custom-file-data/set-custom-file-data.dto';
import { UserSetTrackCustomDataBodyDto, UserSetTrackCustomDataQueryDto } from './set-track-custom-data.dto';
import { UserSetTrackCustomDataService } from './set-track-custom-data.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetTrackCustomDataController {
  constructor(private readonly setTrackCustomDataService: UserSetTrackCustomDataService) {}

  @Patch('set-track-custom-data')
  @ApiOperation({
    summary: `Set custom data for a track in the user's account`,
    description: [
      `Assigns custom data to a track file, overriding the embedded data within it.`,
      `The next indexing pass of the file will reflect the newly set custom data.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Custom data set successfully',
    type: UserSetCustomFileDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserSetCustomFileDataNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetCustomFileDataBadRequestResponseDto,
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: UserSetTrackCustomDataQueryDto,
    @Body() body: UserSetTrackCustomDataBodyDto,
  ) {
    await this.setTrackCustomDataService.setTrackData(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
