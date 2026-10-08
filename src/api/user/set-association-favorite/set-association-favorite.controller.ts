import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetAssociationFavoriteQueryDto,
  UserSetAssociationFavoriteResponseDto,
} from './set-association-favorite.dto';
import { UserSetAssociationFavoriteService } from './set-association-favorite.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserSetAssociationFavoriteController {
  constructor(private readonly setAssociationFavoriteService: UserSetAssociationFavoriteService) {}

  @ApiEndpoint(Put, 'set-association-favorite', HttpStatus.OK, {
    summary: `Mark an association as a favorite`,
    description: [
      `Favorites an associated artist, composer or genre allowing easier access in the user's library.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetAssociationFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserSetAssociationFavoriteQueryDto),
    },
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetAssociationFavoriteQueryDto,
  ): Promise<UserSetAssociationFavoriteResponseDto> {
    await this.setAssociationFavoriteService.setAssociationFavorite(user.id, query.id, query.associationType);
    return {
      success: true,
    };
  }
}
