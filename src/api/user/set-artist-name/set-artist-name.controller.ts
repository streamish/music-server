import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetArtistNameBadRequestResponseDto,
  UserSetArtistNameBodyDto,
  UserSetArtistNameNotFoundResponseDto,
  UserSetArtistNameQueryDto,
  UserSetArtistNameResponseDto,
} from './set-artist-name.dto';
import { UserSetArtistNameService } from './set-artist-name.service';

@UserController()
export class UserSetArtistNameController {
  constructor(private readonly setArtistNameService: UserSetArtistNameService) {}

  @ApiEndpoint(Patch, 'set-artist-name', HttpStatus.OK, {
    summary: `Set custom name for an artist, overriding the name embedded in albums.`,
    description: [
      `Assigns a custom name to an artist, overriding the name embedded in albums.`,
      `This affects all tracks and albums the artist is credited on under the previous name.`,
      `The next indexing pass of the albums will reflect the newly set custom name.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetArtistNameResponseDto,
      [HttpStatus.NOT_FOUND]: UserSetArtistNameNotFoundResponseDto,
      [HttpStatus.BAD_REQUEST]: UserSetArtistNameBadRequestResponseDto,
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: UserSetArtistNameQueryDto,
    @Body() body: UserSetArtistNameBodyDto,
  ) {
    await this.setArtistNameService.setArtistName(user.id, query.id, body.name);
    return {
      success: true,
    };
  }
}
