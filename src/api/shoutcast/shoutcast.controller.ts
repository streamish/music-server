import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from '../api.decorator';
import { ApiShoutcastService } from './shoutcast.service';
import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import {
  CreateShoutcastGenreBodyDto,
  CreateShoutcastGenreResponseDto,
  CreateShoutcastStationBodyDto,
  CreateShoutcastStationResponseDto,
  DeleteShoutcastGenreQueryDto,
  DeleteShoutcastStationQueryDto,
  ListOnlineShoutcastStationsQueryDto,
  ListOnlineShoutcastStationsResponseDto,
  ListShoutcastGenresResponseDto,
  ListShoutcastStationsResponseDto,
  UpdateShoutcastGenreBodyDto,
  UpdateShoutcastGenreQueryDto,
  UpdateShoutcastStationBodyDto,
  UpdateShoutcastStationQueryDto,
} from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { SuccessResponseDto, getValidationMessages } from 'src/api/response.dto';
import { User } from 'src/api/user.decorator';

@Controller('api')
export class ApiShoutcastController {
  constructor(private readonly shoutcastService: ApiShoutcastService) {}

  @ApiEndpoint(Post, 'create-shoutcast-genre', HttpStatus.OK, {
    summary: 'Add a SHOUTcast genre',
    description: 'Add another SHOUTcast genre.  The genre must be a real genre as-recognized by SHOUTcast.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateShoutcastGenreResponseDto,
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.SHOUTCAST_GENRE_ALREADY_EXISTS_ERROR,
        ...getValidationMessages(CreateShoutcastGenreBodyDto),
      ],
    },
  })
  async createGenre(@User() user: AccountEntity, @Body() body: CreateShoutcastGenreBodyDto) {
    const genre = await this.shoutcastService.createGenre(user.id, body.name);
    return {
      genre,
      success: true,
    };
  }

  @ApiEndpoint(Post, 'create-shoutcast-station', HttpStatus.OK, {
    summary: 'Add a SHOUTcast station',
    description: 'Add a custom station by its name and URL/IP address, optionally setting it as a favorite.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: CreateShoutcastStationResponseDto,
      [HttpStatus.BAD_REQUEST]: getValidationMessages(CreateShoutcastStationBodyDto),
    },
  })
  async createStation(@User() user: AccountEntity, @Body() body: CreateShoutcastStationBodyDto) {
    const station = await this.shoutcastService.createStation(user.id, body.url, body.title, body.favorite);
    return {
      station,
      success: true,
    };
  }

  @ApiEndpoint(Delete, 'delete-shoutcast-genre', HttpStatus.OK, {
    summary: 'Delete a SHOUTcast genre',
    description: 'Delete a SHOUTcast genre by its ID',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR,
        ...getValidationMessages(DeleteShoutcastGenreQueryDto),
      ],
    },
  })
  async deleteGenre(@User() user: AccountEntity, @Query() query: DeleteShoutcastGenreQueryDto) {
    await this.shoutcastService.deleteGenre(user.id, query.id);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Delete, 'delete-shoutcast-station', HttpStatus.OK, {
    summary: 'Delete a custom station',
    description: 'Delete a custom SHOUTcast station by its ID',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR,
        ...getValidationMessages(DeleteShoutcastStationQueryDto),
      ],
    },
  })
  async deleteStation(@User() user: AccountEntity, @Query() query: DeleteShoutcastStationQueryDto) {
    await this.shoutcastService.deleteStation(user.id, query.id);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Get, 'list-shoutcast-genres', HttpStatus.OK, {
    summary: 'List SHOUTcast genres',
    description: [
      'Lists all SHOUTcast genres for the authenticated user.',
      'This is a hard-coded list of genres in the database.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: ListShoutcastGenresResponseDto,
    },
  })
  async listGenres(@User() user: AccountEntity) {
    const data = await this.shoutcastService.listGenres(user.id);
    return {
      ...data,
      success: true,
    };
  }

  @ApiEndpoint(Get, 'list-shoutcast-stations', HttpStatus.OK, {
    summary: 'List SHOUTcast stations',
    description: [
      'Lists all custom SHOUTcast stations for the authenticated user.',
      'This is likely a short list so it is not paginated or filtered.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: ListShoutcastStationsResponseDto,
    },
  })
  async listStations(@User() user: AccountEntity) {
    const data = await this.shoutcastService.listStations(user.id);
    return {
      ...data,
      success: true,
    };
  }

  @ApiEndpoint(Get, 'list-online-shoutcast-stations', HttpStatus.OK, {
    summary: 'List online SHOUTcast stations',
    description: [
      'Lists all online SHOUTcast stations for the specified genre.',
      'This is a short list fetched from `shoutcast.com` so it is not paginated or filtered.',
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: ListOnlineShoutcastStationsResponseDto,
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR,
        ...getValidationMessages(ListOnlineShoutcastStationsQueryDto),
      ],
      [HttpStatus.NOT_FOUND]: [ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR],
    },
  })
  async listOnlineStations(@User() user: AccountEntity, @Query() query: ListOnlineShoutcastStationsQueryDto) {
    const data = await this.shoutcastService.listOnlineStations(user.id, query.id);
    return {
      ...data,
      success: true,
    };
  }

  @ApiEndpoint(Patch, 'update-shoutcast-genre', HttpStatus.OK, {
    summary: 'Update a custom genre',
    description: 'Update the details of a custom SHOUTcast genre by its ID.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.SHOUTCAST_GENRE_NOT_FOUND_ERROR,
        ...getValidationMessages(UpdateShoutcastGenreQueryDto),
        ...getValidationMessages(UpdateShoutcastGenreBodyDto),
      ],
    },
  })
  async updateGenre(
    @User() user: AccountEntity,
    @Query() query: UpdateShoutcastGenreQueryDto,
    @Body() body: UpdateShoutcastGenreBodyDto,
  ) {
    await this.shoutcastService.updateGenre(user.id, query.id, body.name);
    return {
      success: true,
    };
  }

  @ApiEndpoint(Patch, 'update-shoutcast-station', HttpStatus.OK, {
    summary: 'Update a custom station',
    description: 'Update the details of a custom SHOUTcast station by its ID.',
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: SuccessResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.SHOUTCAST_STATION_NOT_FOUND_ERROR,
        ...getValidationMessages(UpdateShoutcastStationQueryDto),
        ...getValidationMessages(UpdateShoutcastStationBodyDto),
      ],
    },
  })
  async updateStation(
    @User() user: AccountEntity,
    @Query() query: UpdateShoutcastStationQueryDto,
    @Body() body: UpdateShoutcastStationBodyDto,
  ) {
    await this.shoutcastService.updateStation(user.id, query.id, body.url, body.title);
    return {
      success: true,
    };
  }
}
