import { AccountEntity } from 'src/database/entities';
import { ApiCustomDataService } from './custom-data.service';
import { ApiEndpoint } from 'src/api/api.decorator';
import { Body, Controller, Delete, HttpStatus, Patch, Put, Query } from '@nestjs/common';
import {
  DeleteCustomDataQueryDto,
  SetAlbumCustomDataBodyDto,
  SetAlbumCustomDataQueryDto,
  SetAssociationNameBodyDto,
  SetAssociationNameQueryDto,
  SetCustomDataBodyDto,
  SetCustomDataQueryDto,
  SetTrackCustomDataBodyDto,
  SetTrackCustomDataQueryDto,
} from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiCustomDataController {
  constructor(private readonly customDataService: ApiCustomDataService) {}

  /**
   * `DELETE` request to `/api/delete-custom-data`
   */
  @ApiEndpoint(Delete, 'delete-custom-data', HttpStatus.OK, {
    summary: `Remove custom data from a file in the user's account`,
    description: [
      `Deletes the specified custom data in the database immediately.`,
      `The indexer will immediately recan the track to revert its changes in your library.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: getValidationMessages(DeleteCustomDataQueryDto),
    },
  })
  async deleteCustomData(@User() user: AccountEntity, @Query() query: DeleteCustomDataQueryDto) {
    await this.customDataService.deleteCustomData(user.id, query.id);
    return {
      success: true,
    };
  }

  /**
   * `PATCH` request to /api/set-album-custom-data`
   */
  @ApiEndpoint(Patch, 'set-album-custom-data', HttpStatus.OK, {
    summary: `Set custom data for an album in the user's account`,
    description: [
      `Assigns custom data to an album, overriding the embedded data within its tracks.`,
      `This affects all tracks within the album.`,
      `The indexer will immediately recan the album's tracks to apply its changes to your library.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ALBUM_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(SetAlbumCustomDataQueryDto),
        ...getValidationMessages(SetAlbumCustomDataBodyDto),
      ],
    },
  })
  async setAlbumData(
    @User() user: AccountEntity,
    @Query() query: SetAlbumCustomDataQueryDto,
    @Body() body: SetAlbumCustomDataBodyDto,
  ) {
    await this.customDataService.setAlbumData(user.id, query.id, body);
    return {
      success: true,
    };
  }

  /**
   * `PATCH` request to /api/set-association-name`
   */
  @ApiEndpoint(Patch, 'set-association-name', HttpStatus.OK, {
    summary: `Set custom name for an association`,
    description: [
      `Assigns a custom name to an associated artist, composer or genre, overriding the embedded track data.`,
      `The indexer will immediately recan the affected files to apply its changes to your library.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ARTIST_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(SetAssociationNameQueryDto),
        ...getValidationMessages(SetAssociationNameBodyDto),
      ],
    },
  })
  async setArtistName(
    @User() user: AccountEntity,
    @Query() query: SetAssociationNameQueryDto,
    @Body() body: SetAssociationNameBodyDto,
  ) {
    await this.customDataService.setAssociationName(user.id, query.id, body.name);
    return {
      success: true,
    };
  }

  /**
   * `PATCH` reuquest to `/api/set-custom-data`
   */
  @ApiEndpoint(Put, 'set-custom-data', HttpStatus.OK, {
    summary: `Set custom data for a track in the user's account`,
    description: [
      `Assigns custom data to a track, overriding the embedded data within it.`,
      `This data is all-inclusive, compared to similar endpoints that set individual field(s).`,
      `The indexer will immediately recan the track to apply its changes to your library.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(SetCustomDataQueryDto),
        ...getValidationMessages(SetCustomDataBodyDto),
      ],
    },
  })
  async put(@User() user: AccountEntity, @Query() query: SetCustomDataQueryDto, @Body() body: SetCustomDataBodyDto) {
    await this.customDataService.setCustomData(user.id, query.id, body);
    return {
      success: true,
    };
  }

  /**
   * `PATCH` reuquest to `/api/set-track-custom-data`
   */
  @ApiEndpoint(Patch, 'set-track-custom-data', HttpStatus.OK, {
    summary: `Set custom data for a track in the user's account`,
    description: [
      `Assigns custom data to a track, overriding the embedded data within it.`,
      `The indexer will immediately recan the track to apply its changes to your library.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.TRACK_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(SetTrackCustomDataQueryDto),
        ...getValidationMessages(SetTrackCustomDataBodyDto),
      ],
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: SetTrackCustomDataQueryDto,
    @Body() body: SetTrackCustomDataBodyDto,
  ) {
    await this.customDataService.setTrackData(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
