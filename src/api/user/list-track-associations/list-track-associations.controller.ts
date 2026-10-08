import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserListTrackAssociationsQueryDto, UserListTrackAssociationsResponseDto } from './list-track-associations.dto';
import { UserListTrackAssociationsService } from './list-track-associations.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserListTrackAssociationsController {
  constructor(private readonly listTrackAssociationsService: UserListTrackAssociationsService) {}

  @ApiEndpoint(Get, 'list-track-associations', HttpStatus.OK, {
    summary: 'List track-associated artists, composers and genres',
    description: 'Track associations are artists, composers and genres attributed directly to individual tracks.',
    isAuthenticated: true,
    isFiltered: true,
    isPaginated: true,
    excludeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: UserListTrackAssociationsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserListTrackAssociationsQueryDto),
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListTrackAssociationsQueryDto,
  ): Promise<UserListTrackAssociationsResponseDto> {
    const data = await this.listTrackAssociationsService.listAssociations(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
