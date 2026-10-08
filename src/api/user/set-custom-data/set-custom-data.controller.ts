import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetCustomDataBadRequestResponseDto,
  UserSetCustomDataBodyDto,
  UserSetCustomDataNotFoundResponseDto,
  UserSetCustomDataQueryDto,
  UserSetCustomDataResponseDto,
} from './set-custom-data.dto';
import { UserSetCustomDataService } from './set-custom-data.service';

@UserController()
export class UserSetCustomDataController {
  constructor(private readonly setCustomDataService: UserSetCustomDataService) {}

  @ApiEndpoint(Put, 'set-custom-data', HttpStatus.OK, {
    summary: `Set custom data for a track in the user's account`,
    description: [
      `Assigns custom data to a track, overriding the embedded data within it.`,
      `This data is all-inclusive, compared to similar endpoints that set individual field(s).`,
      `The next indexing pass of the track will reflect the newly set custom data.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetCustomDataResponseDto,
      [HttpStatus.NOT_FOUND]: UserSetCustomDataNotFoundResponseDto,
      [HttpStatus.BAD_REQUEST]: UserSetCustomDataBadRequestResponseDto,
    },
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
