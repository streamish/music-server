import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserListFavoritesBadRequestResponseDto,
  UserListFavoritesQueryDto,
  UserListFavoritesResponseDto,
} from './list-favorites.dto';
import { UserListFavoritesService } from './list-favorites.service';

@UserController()
export class UserListFavoritesController {
  constructor(private readonly listFavoritesService: UserListFavoritesService) {}

  @ApiEndpoint(Get, 'list-favorites', HttpStatus.OK, {
    summary: 'List favorites',
    description: 'Favorites can be albums, tracks, folders, or an associated artist, composer or genre.',
    isAuthenticated: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: UserListFavoritesResponseDto,
      [HttpStatus.BAD_REQUEST]: UserListFavoritesBadRequestResponseDto,
    },
  })
  async get(@User() user: AccountEntity, @Query() query: UserListFavoritesQueryDto) {
    const data = await this.listFavoritesService.listFavorites(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
