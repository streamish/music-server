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
  UserSetCustomDataBadRequestResponseDto,
  UserSetCustomDataBodyDto,
  UserSetCustomDataNotFoundResponseDto,
  UserSetCustomDataQueryDto,
  UserSetCustomDataResponseDto,
} from './set-custom-data.dto';
import { UserSetCustomDataService } from './set-custom-data.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetCustomDataController {
  constructor(private readonly setCustomDataService: UserSetCustomDataService) {}

  @Put('set-custom-data')
  @ApiOperation({
    summary: `Set custom data for a track in the user's account`,
    description: [
      `Assigns custom data to a track, overriding the embedded data within it.`,
      `This data is all-inclusive, compared to similar endpoints that set individual field(s).`,
      `The next indexing pass of the track will reflect the newly set custom data.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Custom data set successfully',
    type: UserSetCustomDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserSetCustomDataNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetCustomDataBadRequestResponseDto,
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetCustomDataQueryDto,
    @Body() body: UserSetCustomDataBodyDto,
  ) {
    await this.setCustomDataService.setCustomData(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
