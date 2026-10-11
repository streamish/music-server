import { AccountEntity } from 'src/database/entities';
import { ApiAssociationsService } from './associations.service';
import { ApiEndpoint } from 'src/api/api.decorator';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import {
  ListAlbumAssociationsQueryDto,
  ListAssociationsResponseDto,
  ListAssociationsWithTracksResponseDto,
  ListTrackAssociationsQueryDto,
  RetrieveAssociationQueryDto,
  RetrieveAssociationResponseDto,
} from './dtos';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';

@Controller('/api')
export class ApiAssociationsController {
  constructor(private readonly associationsService: ApiAssociationsService) {}

  /**
   * `GET` request to `/api/list-album-assocations`
   */
  @ApiEndpoint(Get, 'list-album-associations', HttpStatus.OK, {
    summary: 'List associations credited to albums',
    description: 'Lists artists attributed directly to an album, and composers and genres aggregated from its tracks.',
    allowAdministrator: true,
    allowUser: true,
    isPaginated: true,
    isFiltered: true,
    excludeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: ListAssociationsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListAlbumAssociationsQueryDto),
    },
  })
  async listAssociations(@User() user: AccountEntity, @Query() query: ListAlbumAssociationsQueryDto) {
    const data = await this.associationsService.listAlbumAssociations(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-album-assocations-with-tracks`
   */
  @ApiEndpoint(Get, 'list-album-associations-with-tracks', HttpStatus.OK, {
    summary: 'List artists credited to albums including their track-lists',
    description:
      'Lists artists attributed directly to an album, and the composers and genres aggregated from its tracks.',
    allowAdministrator: true,
    allowUser: true,
    isFiltered: true,
    includeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: ListAssociationsWithTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListAlbumAssociationsQueryDto),
    },
  })
  async listAssociationsWithTracks(@User() user: AccountEntity, @Query() query: ListAlbumAssociationsQueryDto) {
    const data = await this.associationsService.listAlbumAssociationsWithTracks(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-track-assocations`
   */
  @ApiEndpoint(Get, 'list-track-associations', HttpStatus.OK, {
    summary: 'List track-associated artists, composers and genres',
    description: 'Track associations are artists, composers and genres attributed directly to individual tracks.',
    allowAdministrator: true,
    allowUser: true,
    isFiltered: true,
    isPaginated: true,
    excludeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: ListAssociationsResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListTrackAssociationsQueryDto),
    },
  })
  async listTrackAssociations(@User() user: AccountEntity, @Query() query: ListTrackAssociationsQueryDto) {
    const data = await this.associationsService.listTrackAssociations(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/list-track-assocations-with-tracks`
   */
  @ApiEndpoint(Get, 'list-track-associations-with-tracks', HttpStatus.OK, {
    summary: 'List track-associated artists, composers and genres including their track-lists',
    description: 'Track associations are artists, composers and genres attributed directly to individual tracks.',
    allowAdministrator: true,
    allowUser: true,
    isFiltered: true,
    isPaginated: true,
    includeTrackInformation: true,
    responses: {
      [HttpStatus.OK]: ListAssociationsWithTracksResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(ListTrackAssociationsQueryDto),
    },
  })
  async listTrackAssociationsWithTracks(@User() user: AccountEntity, @Query() query: ListTrackAssociationsQueryDto) {
    const data = await this.associationsService.listTrackAssociationsWithTracks(user.id, query);
    return {
      ...data,
      success: true,
    };
  }

  /**
   * `GET` request to `/api/retrieve-association`
   */
  @ApiEndpoint(Get, 'retrieve-association', HttpStatus.OK, {
    summary: 'Retrieves single association',
    description: [
      `Retrieves an association and its complete track list with all information necessary for viewing and playback.`,
    ].join('\n'),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: RetrieveAssociationResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ASSOCIATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(RetrieveAssociationQueryDto),
    },
  })
  async retrieveAssociation(@User() user: AccountEntity, @Query() query: RetrieveAssociationQueryDto) {
    const association = await this.associationsService.retrieveAssociation(user.id, query.id);
    return {
      success: true,
      association,
    };
  }
}
