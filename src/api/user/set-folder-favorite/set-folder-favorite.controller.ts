import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { ErrorCodes } from 'src/constants/error-codes';
import { HttpStatus, Put, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserSetFolderFavoriteQueryDto, UserSetFolderFavoriteResponseDto } from './set-folder-favorite.dto';
import { UserSetFolderFavoriteService } from './set-folder-favorite.service';

@UserController()
export class UserSetFolderFavoriteController {
  constructor(private readonly setFolderFavoriteService: UserSetFolderFavoriteService) {}

  @ApiEndpoint(Put, 'set-folder-favorite', HttpStatus.OK, {
    summary: `Mark a folder as a favorite `,
    description: [`Favorites the specified folder allowing easier access in the user's library.`].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetFolderFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.FOLDER_NOT_FOUND_ERROR],
    },
  })
  async put(@User() user: AccountEntity, @Query() query: UserSetFolderFavoriteQueryDto) {
    await this.setFolderFavoriteService.setFolderFavorite(user.id, query.folder);
    return {
      success: true,
    };
  }
}
