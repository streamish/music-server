import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetAlbumCustomDataBadRequestResponseDto,
  UserSetAlbumCustomDataBodyDto,
  UserSetAlbumCustomDataNotFoundResponseDto,
  UserSetAlbumCustomDataQueryDto,
  UserSetAlbumCustomDataResponseDto,
} from './set-album-custom-data.dto';
import { UserSetAlbumCustomDataService } from './set-album-custom-data.service';

@UserController()
export class UserSetAlbumCustomDataController {
  constructor(private readonly setAlbumCustomDataService: UserSetAlbumCustomDataService) {}

  @ApiEndpoint(Patch, 'set-album-custom-data', HttpStatus.OK, {
    summary: `Set custom data for an album in the user's account`,
    description: [
      `Assigns custom data to an album, overriding the embedded data within its tracks.`,
      `This affects all tracks within the album.`,
      `The next indexing pass of the album will reflect the newly set custom data.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetAlbumCustomDataResponseDto,
      [HttpStatus.NOT_FOUND]: UserSetAlbumCustomDataNotFoundResponseDto,
      [HttpStatus.BAD_REQUEST]: UserSetAlbumCustomDataBadRequestResponseDto,
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: UserSetAlbumCustomDataQueryDto,
    @Body() body: UserSetAlbumCustomDataBodyDto,
  ) {
    await this.setAlbumCustomDataService.setAlbumData(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
