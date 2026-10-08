import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_BEARER_AUTH, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserRetrieveAssociationNotFoundResponseDto,
  UserRetrieveAssociationQueryDto,
  UserRetrieveAssociationResponseDto,
} from './retrieve-association.dto';
import { UserRetrieveAssociationService } from './retrieve-association.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserRetrieveAssociationController {
  constructor(private readonly retrieveAssociationService: UserRetrieveAssociationService) {}

  @Get('retrieve-association')
  @ApiOperation({
    summary: 'Retrieves single association',
    description: [
      `Retrieves an association and its complete track list with all information necessary for viewing and playback.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_BEARER_AUTH)
  @ApiOkResponse({
    description: 'Successfully retrieved the association data for the user.',
    type: UserRetrieveAssociationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Association not found',
    type: UserRetrieveAssociationNotFoundResponseDto,
  })
  async get(@User() user: AccountEntity, @Query() query: UserRetrieveAssociationQueryDto) {
    const association = await this.retrieveAssociationService.retrieveAssociation(user.id, query.id);
    return {
      success: true,
      association,
    };
  }
}
