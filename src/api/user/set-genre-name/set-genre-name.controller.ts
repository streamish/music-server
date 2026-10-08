import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { UserSetGenreNameBodyDto, UserSetGenreNameQueryDto, UserSetGenreNameResponseDto } from './set-genre-name.dto';
import { UserSetGenreNameService } from './set-genre-name.service';
import { getValidationMessages } from 'src/api/response.dto';

@UserController()
export class UserSetGenreNameController {
  constructor(private readonly setGenreNameService: UserSetGenreNameService) {}

  @ApiEndpoint(Patch, 'set-genre-name', HttpStatus.OK, {
    summary: `Set custom name for a genre, overriding the name embedded in tracks.`,
    description: [
      `Assigns a custom name to a genre, overriding the name embedded in tracks.`,
      `This affects all tracks categorized under the previous genre name.`,
      `The next indexing pass of the tracks will reflect the newly set custom name.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetGenreNameResponseDto,
      [HttpStatus.NOT_FOUND]: [ErrorCodes.GENRE_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ...getValidationMessages(UserSetGenreNameQueryDto),
        ...getValidationMessages(UserSetGenreNameBodyDto),
      ],
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: UserSetGenreNameQueryDto,
    @Body() body: UserSetGenreNameBodyDto,
  ) {
    await this.setGenreNameService.setGenreName(user.id, query.id, body.name);
    return {
      success: true,
    };
  }
}
