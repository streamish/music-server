import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import {
  UserSetTrackCustomDataBodyDto,
  UserSetTrackCustomDataQueryDto,
  UserSetTrackCustomDataResponseDto,
} from './set-track-custom-data.dto';
import { UserSetTrackCustomDataService } from './set-track-custom-data.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserSetTrackCustomDataController {
  constructor(private readonly setTrackCustomDataService: UserSetTrackCustomDataService) {}

  @ApiEndpoint(Patch, 'set-track-custom-data', HttpStatus.OK, {
    summary: `Set custom data for a track in the user's account`,
    description: [
      `Assigns custom data to a track, overriding the embedded data within it.`,
      `The next indexing pass of the file will reflect the newly set custom data.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetTrackCustomDataResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(UserSetTrackCustomDataQueryDto),
        ...getValidationMessages(UserSetTrackCustomDataBodyDto),
      ],
    },
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
