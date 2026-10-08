import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_BEARER_AUTH, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserDeleteCustomDataNotFoundResponseDto,
  UserDeleteCustomDataQueryDto,
  UserDeleteCustomDataResponseDto,
} from './delete-custom-data.dto';
import { UserDeleteCustomDataService } from './delete-custom-data.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserDeleteCustomDataController {
  constructor(private readonly deleteCustomDataService: UserDeleteCustomDataService) {}

  @Delete('delete-custom-data')
  @ApiOperation({
    summary: `Remove custom data from a file in the user's account`,
    description: [
      `Deletes the specified custom data in the database immediately.`,
      `The file this data is for will revert to its embedded data on its next indexing.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Custom data deleted successfully',
    type: UserDeleteCustomDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserDeleteCustomDataNotFoundResponseDto,
  })
  async delete(@User() user: AccountEntity, @Query() query: UserDeleteCustomDataQueryDto) {
    await this.deleteCustomDataService.deleteCustomData(user.id, query.id);
    return {
      success: true,
    };
  }
}
