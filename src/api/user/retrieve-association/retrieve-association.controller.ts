import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRetrieveAssociationQueryDto, UserRetrieveAssociationResponseDto } from './retrieve-association.dto';
import { UserRetrieveAssociationService } from './retrieve-association.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserRetrieveAssociationController {
  constructor(private readonly retrieveAssociationService: UserRetrieveAssociationService) {}

  @ApiEndpoint(Get, 'retrieve-association', HttpStatus.OK, {
    summary: 'Retrieves single association',
    description: [
      `Retrieves an association and its complete track list with all information necessary for viewing and playback.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserRetrieveAssociationResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserRetrieveAssociationQueryDto),
    },
  })
  async get(@User() user: AccountEntity, @Query() query: UserRetrieveAssociationQueryDto) {
    const association = await this.retrieveAssociationService.retrieveAssociation(user.id, query.id);
    return {
      success: true,
      association,
    };
  }
}
