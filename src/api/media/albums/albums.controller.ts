import { AccountEntity } from 'src/database/entities';
import { ApiAlbumsService } from './albums.service';
import { ApiEndpoint } from 'src/api/api.decorator';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import {
  ListAlbumsQueryDto,
  ListAlbumsResponseDto,
  ListAlbumsWithTracksResponseDto,
  RetrieveAlbumQueryDto,
  RetrieveAlbumResponseDto,
} from './dtos';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';

@Controller('/api')
export class ApiAlbumsController {
  constructor(private readonly albumsService: ApiAlbumsService) {}

  /**
   * `GET` request to /api/list-albums
   */
  @ApiEndpoint(Get, 'list-albums', HttpStatus.OK, {
    summary: 'List albums',
    description: 'Albums can be filtered by an extensive set of criteria and search terms.',
    allowAdministrator: true,
    allowUser: true,
    isFiltered: true,
    isPaginated: true,
    excludeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: ListAlbumsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListAlbumsQueryDto),
    },
  })
  async listAlbums(@User() user: AccountEntity, @Query() query: ListAlbumsQueryDto) {
    const data = await this.albumsService.listAlbums(user.id, query);
    return {
      ...data,
      success: true,
    } as ListAlbumsResponseDto;
  }

  /**
   * `GET` request to /api/list-albums-with-tracks
   */
  @ApiEndpoint(Get, 'list-albums-with-tracks', HttpStatus.OK, {
    summary: 'List albums and include their track data',
    description: 'Albums can be filtered by an extensive set of criteria and search terms.',
    allowUser: true,
    allowAdministrator: true,
    isFiltered: true,
    isPaginated: true,
    includeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: ListAlbumsWithTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListAlbumsQueryDto),
    },
  })
  async listAlbumsWithTracks(@User() user: AccountEntity, @Query() query: ListAlbumsQueryDto) {
    const data = await this.albumsService.listAlbumsWithTracks(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/retrieve-album`
   */
  @ApiEndpoint(Get, 'retrieve-album', HttpStatus.OK, {
    summary: 'Retrieves single albums',
    description:
      'Retrieves an album and its complete track list with all information necessary for viewing and playback.',
    allowUser: true,
    allowAdministrator: true,
    responses: {
      [HttpStatus.OK]: RetrieveAlbumResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR, ...getValidationMessages(RetrieveAlbumQueryDto)],
    },
  })
  async retrieveAlbum(@User() user: AccountEntity, @Query() query: RetrieveAlbumQueryDto) {
    const album = await this.albumsService.retrieveAlbum(user.id, query.id);
    return {
      album,
      success: true,
    };
  }
}
