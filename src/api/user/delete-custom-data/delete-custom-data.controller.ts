import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Delete, HttpStatus, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { UserDeleteCustomDataQueryDto, UserDeleteCustomDataResponseDto } from './delete-custom-data.dto';
import { UserDeleteCustomDataService } from './delete-custom-data.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserDeleteCustomDataController {
  constructor(private readonly deleteCustomDataService: UserDeleteCustomDataService) {}

  @ApiEndpoint(Delete, 'delete-custom-data', HttpStatus.OK, {
    summary: `Remove custom data from a file in the user's account`,
    description: [
      `Deletes the specified custom data in the database immediately.`,
      `The file this data is for will revert to its embedded data on its next indexing.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserDeleteCustomDataResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserDeleteCustomDataQueryDto),
    },
  })
  async delete(@User() user: AccountEntity, @Query() query: UserDeleteCustomDataQueryDto) {
    await this.deleteCustomDataService.deleteCustomData(user.id, query.id);
    return {
      success: true,
    };
  }
}
