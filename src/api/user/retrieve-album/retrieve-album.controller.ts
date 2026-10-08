import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRetrieveAlbumQueryDto, UserRetrieveAlbumResponseDto } from './retrieve-album.dto';
import { UserRetrieveAlbumService } from './retrieve-album.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserRetrieveAlbumController {
  constructor(private readonly retrieveAlbumService: UserRetrieveAlbumService) {}

  @ApiEndpoint(Get, 'retrieve-album', HttpStatus.OK, {
    summary: 'Retrieves single albums',
    description: [
      `Retrieves an album and its complete track list with all information necessary for viewing and playback.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserRetrieveAlbumResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(UserRetrieveAlbumQueryDto),
    },
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserRetrieveAlbumQueryDto,
  ): Promise<UserRetrieveAlbumResponseDto> {
    const album = await this.retrieveAlbumService.retrieveAlbum(user.id, query.id);
    return {
      album,
      success: true,
    };
  }
}
