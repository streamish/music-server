import { AccountEntity } from 'src/database/entities';
import {
  AddPlaylistItemsBodyDto,
  AddPlaylistItemsQueryDto,
  AddPlaylistItemsResponseDto,
  CreatePlaylistBodyDto,
  CreatePlaylistResponseDto,
  CreateSmartPlaylistBodyDto,
  DeletePlaylistQueryDto,
  ListPlaylistItemsQueryDto,
  ListPlaylistItemsResponseDto,
  ListPlaylistsQueryDto,
  ListPlaylistsResponseDto,
  MovePlaylistItemBodyDto,
  MovePlaylistItemQueryDto,
  RemovePlaylistItemsBodyDto,
  RemovePlaylistItemsQueryDto,
  UpdatePlaylistBodyDto,
  UpdatePlaylistQueryDto,
  UpdateSmartPlaylistRulesBodyDto,
  UpdateSmartPlaylistRulesQueryDto,
} from './dtos';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiPlaylistsService } from './playlists.service';
import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiPlaylistsController {
  constructor(private readonly playlistsService: ApiPlaylistsService) {}

  /**
   * `POST` request to `/api/add-playlist-items`
   */
  @ApiEndpoint(Post, 'add-playlist-items', HttpStatus.CREATED, {
    summary: 'Add items to a normal playlist',
    description: [
      'Adds library tracks and/or radio stations to a normal playlist.',
      'Items are appended unless an offset is specified.',
      'Smart playlists cannot have items added.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.CREATED]: AddPlaylistItemsResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR,
        ...getValidationMessages(AddPlaylistItemsQueryDto),
        ...getValidationMessages(AddPlaylistItemsBodyDto),
      ],
    },
  })
  async addPlaylistItems(
    @User() user: AccountEntity,
    @Query() query: AddPlaylistItemsQueryDto,
    @Body() body: AddPlaylistItemsBodyDto,
  ) {
    const playlistItemIds = await this.playlistsService.addItems(user.id, query.id, body);
    return {
      playlistItemIds,
      success: true,
    };
  }

  /**
   * `POST` request to `/api/create-playlist`
   */
  @ApiEndpoint(Post, 'create-playlist', HttpStatus.CREATED, {
    summary: 'Create a normal playlist',
    description: 'Creates an empty playlist that items can be added to and removed from.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.CREATED]: CreatePlaylistResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(CreatePlaylistBodyDto),
    },
  })
  async createPlaylist(@User() user: AccountEntity, @Body() body: CreatePlaylistBodyDto) {
    const playlistId = await this.playlistsService.createPlaylist(user.id, body.name);
    return {
      playlistId,
      success: true,
    };
  }

  /**
   * `POST` request to `/api/create-smart-playlist`
   */
  @ApiEndpoint(Post, 'create-smart-playlist', HttpStatus.CREATED, {
    summary: 'Create a smart playlist',
    description: 'Creates a playlist whose tracks are determined by rules rather than added individually.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.CREATED]: CreatePlaylistResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(CreateSmartPlaylistBodyDto),
    },
  })
  async createSmartPlaylist(@User() user: AccountEntity, @Body() body: CreateSmartPlaylistBodyDto) {
    const playlistId = await this.playlistsService.createSmartPlaylist(user.id, body);
    return {
      playlistId,
      success: true,
    };
  }

  /**
   * `DELETE` request to `/api/delete-playlist`
   */
  @ApiEndpoint(Delete, 'delete-playlist', HttpStatus.OK, {
    summary: 'Delete a playlist',
    description: 'Deletes the playlist along with its items or rules.  Library tracks are not affected.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(DeletePlaylistQueryDto),
    },
  })
  async deletePlaylist(@User() user: AccountEntity, @Query() query: DeletePlaylistQueryDto) {
    await this.playlistsService.deletePlaylist(user.id, query.id);
    return {
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-playlist-items`
   */
  @ApiEndpoint(Get, 'list-playlist-items', HttpStatus.OK, {
    summary: 'List the contents of a playlist',
    description: [
      'Normal playlists return their saved tracks and radio stations in playlist order.',
      'Smart playlists return the library tracks matching their rules, or every track if they have no rules.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: ListPlaylistItemsResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListPlaylistItemsQueryDto),
    },
  })
  async listPlaylistItems(@User() user: AccountEntity, @Query() query: ListPlaylistItemsQueryDto) {
    const data = await this.playlistsService.listPlaylistItems(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-playlists`
   */
  @ApiEndpoint(Get, 'list-playlists', HttpStatus.OK, {
    summary: 'List playlists',
    description: 'Lists the normal and smart playlists of the user.  Smart playlists include their rules.',
    allowAdministrator: true,
    allowUser: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: ListPlaylistsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListPlaylistsQueryDto),
    },
  })
  async listPlaylists(@User() user: AccountEntity, @Query() query: ListPlaylistsQueryDto) {
    const data = await this.playlistsService.listPlaylists(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `PATCH` request to `/api/move-playlist-item`
   */
  @ApiEndpoint(Patch, 'move-playlist-item', HttpStatus.OK, {
    summary: 'Move an item within a normal playlist',
    description: 'Moves a playlist item to a new zero-based position, shifting the other items to make room.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR, ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR,
        ...getValidationMessages(MovePlaylistItemQueryDto),
        ...getValidationMessages(MovePlaylistItemBodyDto),
      ],
    },
  })
  async movePlaylistItem(
    @User() user: AccountEntity,
    @Query() query: MovePlaylistItemQueryDto,
    @Body() body: MovePlaylistItemBodyDto,
  ) {
    await this.playlistsService.moveItem(user.id, query.id, body.playlistItemId, body.offset);
    return {
      success: true,
    };
  }

  /**
   * `DELETE` request to `/api/remove-playlist-items`
   */
  @ApiEndpoint(Delete, 'remove-playlist-items', HttpStatus.OK, {
    summary: 'Remove items from a normal playlist',
    description: 'Removes the specified playlist items and closes the gap in the remaining positions.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR, ErrorCodes.PLAYLIST_ITEMS_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(RemovePlaylistItemsQueryDto),
        ...getValidationMessages(RemovePlaylistItemsBodyDto),
      ],
    },
  })
  async removePlaylistItems(
    @User() user: AccountEntity,
    @Query() query: RemovePlaylistItemsQueryDto,
    @Body() body: RemovePlaylistItemsBodyDto,
  ) {
    await this.playlistsService.removeItems(user.id, query.id, body.playlistItemIds);
    return {
      success: true,
    };
  }

  /**
   * `PATCH` request to `/api/update-playlist`
   */
  @ApiEndpoint(Patch, 'update-playlist', HttpStatus.OK, {
    summary: 'Rename a playlist',
    description: 'Updates the name of a normal or smart playlist.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(UpdatePlaylistQueryDto),
        ...getValidationMessages(UpdatePlaylistBodyDto),
      ],
    },
  })
  async updatePlaylist(
    @User() user: AccountEntity,
    @Query() query: UpdatePlaylistQueryDto,
    @Body() body: UpdatePlaylistBodyDto,
  ) {
    await this.playlistsService.updatePlaylist(user.id, query.id, body.name);
    return {
      success: true,
    };
  }

  /**
   * `PATCH` request to `/api/update-smart-playlist-rules`
   */
  @ApiEndpoint(Patch, 'update-smart-playlist-rules', HttpStatus.OK, {
    summary: 'Update the rules of a smart playlist',
    description: 'Replaces all existing rules and the conjugal of a smart playlist.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.PLAYLIST_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.INVALID_PLAYLIST_TYPE_ERROR,
        ...getValidationMessages(UpdateSmartPlaylistRulesQueryDto),
        ...getValidationMessages(UpdateSmartPlaylistRulesBodyDto),
      ],
    },
  })
  async updateSmartPlaylistRules(
    @User() user: AccountEntity,
    @Query() query: UpdateSmartPlaylistRulesQueryDto,
    @Body() body: UpdateSmartPlaylistRulesBodyDto,
  ) {
    await this.playlistsService.updateSmartPlaylistRules(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
