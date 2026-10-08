import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserRetrieveAssociationNotFoundResponseDto,
  UserRetrieveAssociationQueryDto,
  UserRetrieveAssociationResponseDto,
} from './retrieve-association.dto';
import { UserRetrieveAssociationService } from './retrieve-association.service';

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
      [HttpStatus.NOT_FOUND]: UserRetrieveAssociationNotFoundResponseDto,
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
