import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { FILTERED_DATA_DESCRIPTION, PAGINATED_DATA_DESCRIPTION } from 'src/constants/swagger';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserListTracksQueryDto, UserListTracksResponseDto } from './list-tracks.dto';
import { UserListTracksService } from './list-tracks.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserListTracksController {
  constructor(private readonly listTracksService: UserListTracksService) {}

  @ApiEndpoint(Get, 'list-tracks', HttpStatus.OK, {
    summary: 'List tracks',
    description: [FILTERED_DATA_DESCRIPTION, PAGINATED_DATA_DESCRIPTION].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserListTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserListTracksQueryDto),
    },
  })
  async get(@User() user: AccountEntity, @Query() query: UserListTracksQueryDto) {
    const data = await this.listTracksService.listTracks(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
