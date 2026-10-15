import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiFavoritesService } from './favorites.service';
import { Controller, Delete, Get, HttpStatus, Put, Query } from '@nestjs/common';
import {
  CreateFavoriteResponseDto,
  DeleteFavoriteQueryDto,
  ListFavoritesQueryDto,
  ListFavoritesResponseDto,
  SetAlbumFavoriteQueryDto,
  SetAssociationFavoriteQueryDto,
  SetFolderFavoriteQueryDto,
  SetTrackFavoriteQueryDto,
} from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { SetShoutcastStationFavoriteQueryDto } from './dtos/set-station-favorite.dto';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiFavoritesController {
  constructor(private readonly favoritesService: ApiFavoritesService) {}

  /**
   * `DELETE` request to `/api/delete-favorite`
   */
  @ApiEndpoint(Delete, 'delete-favorite', HttpStatus.OK, {
    summary: `Deletes a favorited item`,
    description: [
      `Immediately deletes the specified favorite from the authenticated user's accounimmediately.`,
      `The album, association or track will no longer be a favorite but will still exist in the user's library.`,
    ].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.FAVORITE_ITEM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(DeleteFavoriteQueryDto),
    },
  })
  async deleteFavorite(@User() user: AccountEntity, @Query() query: DeleteFavoriteQueryDto) {
    await this.favoritesService.deleteFavorite(user.id, query.id);
    return {
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-favorites`
   */
  @ApiEndpoint(Get, 'list-favorites', HttpStatus.OK, {
    summary: 'List favorites',
    description: 'Favorites can be albums, tracks, folders, or an associated artist, composer or genre.',
    allowAdministrator: true,
    allowUser: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: ListFavoritesResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListFavoritesQueryDto),
    },
  })
  async listFavorites(@User() user: AccountEntity, @Query() query: ListFavoritesQueryDto) {
    const data = await this.favoritesService.listFavorites(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `PUT` request to `/api/set-album-favorite`
   */
  @ApiEndpoint(Put, 'set-album-favorite', HttpStatus.OK, {
    summary: `Mark an album as a favorite `,
    description: [`Favorites the specified album allowing easier access in the user's library.`].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(SetAlbumFavoriteQueryDto),
    },
  })
  async setAlbumFavorite(@User() user: AccountEntity, @Query() query: SetAlbumFavoriteQueryDto) {
    const favorite = await this.favoritesService.setAlbumFavorite(user.id, query.id);
    return {
      favoriteId: favorite.id,
      success: true,
    };
  }

  /**
   * `PUT` request to `/api/set-association-favorite`
   */
  @ApiEndpoint(Put, 'set-association-favorite', HttpStatus.OK, {
    summary: `Mark an association as a favorite`,
    description: [
      `Favorites an associated artist, composer or genre allowing easier access in the user's library.`,
    ].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(SetAssociationFavoriteQueryDto),
    },
  })
  async setAssociationFavorite(@User() user: AccountEntity, @Query() query: SetAssociationFavoriteQueryDto) {
    const favorite = await this.favoritesService.setAssociationFavorite(user.id, query.id, query.associationType);
    return {
      favoriteId: favorite.id,
      success: true,
    };
  }

  /**
   * `PUT` request to `/api/set-folder-favorite`
   */
  @ApiEndpoint(Put, 'set-folder-favorite', HttpStatus.OK, {
    summary: `Mark a folder as a favorite `,
    description: [`Favorites the specified folder allowing easier access in the user's library.`].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.FOLDER_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(SetFolderFavoriteQueryDto),
    },
  })
  async setFolderFavorite(@User() user: AccountEntity, @Query() query: SetFolderFavoriteQueryDto) {
    const favorite = await this.favoritesService.setFolderFavorite(user.id, query.folder);
    return {
      favoriteId: favorite.id,
      success: true,
    };
  }

  /**
   * `PUT` request to `/api/set-shoutcast-station-favorite`
   */
  @ApiEndpoint(Put, 'set-shoutcast-station-favorite', HttpStatus.OK, {
    summary: `Mark a shoutcast station as a favorite `,
    description: [`Favorites the specified shoutcast station allowing easier access in the user's library.`].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(SetShoutcastStationFavoriteQueryDto),
    },
  })
  async setShoutcastStationFavorite(@User() user: AccountEntity, @Query() query: SetShoutcastStationFavoriteQueryDto) {
    const favorite = await this.favoritesService.setShoutcastStationFavorite(
      user.id,
      query.shoutcastStationId,
      query.shoutcastStationUrl,
    );
    return {
      favoriteId: favorite.id,
      success: true,
    };
  }

  /**
   * `PUT` request to `/api/set-track-favorite`
   */
  @ApiEndpoint(Put, 'set-track-favorite', HttpStatus.OK, {
    summary: `Mark a track as a favorite `,
    description: [`Favorites the specified track allowing easier access in the user's library.`].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateFavoriteResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(SetTrackFavoriteQueryDto),
    },
  })
  async setTrackFavorite(@User() user: AccountEntity, @Query() query: SetTrackFavoriteQueryDto) {
    const favorite = await this.favoritesService.setTrackFavorite(user.id, query.id);
    return {
      favoriteId: favorite.id,
      success: true,
    };
  }
}
