import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import {
  UserSetComposerNameBadRequestResponseDto,
  UserSetComposerNameBodyDto,
  UserSetComposerNameNotFoundResponseDto,
  UserSetComposerNameQueryDto,
  UserSetComposerNameResponseDto,
} from './set-composer-name.dto';
import { UserSetComposerNameService } from './set-composer-name.service';

@UserController()
export class UserSetComposerNameController {
  constructor(private readonly setComposerNameService: UserSetComposerNameService) {}

  @ApiEndpoint(Patch, 'set-composer-name', HttpStatus.OK, {
    summary: `Set custom name for a composer, overriding the name embedded in tracks.`,
    description: [
      `Assigns a custom name to a composer, overriding the name embedded in tracks.`,
      `This affects all tracks the composer is credited on under the previous name.`,
      `The next indexing pass of the tracks will reflect the newly set custom name.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserSetComposerNameResponseDto,
      [HttpStatus.NOT_FOUND]: UserSetComposerNameNotFoundResponseDto,
      [HttpStatus.BAD_REQUEST]: UserSetComposerNameBadRequestResponseDto,
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: UserSetComposerNameQueryDto,
    @Body() body: UserSetComposerNameBodyDto,
  ) {
    await this.setComposerNameService.setComposerName(user.id, query.id, body.name);
    return {
      success: true,
    };
  }
}
