import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Patch, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetCustomFileDataBadRequestResponseDto,
  UserSetCustomFileDataNotFoundResponseDto,
  UserSetCustomFileDataResponseDto,
} from '../set-custom-file-data/set-custom-file-data.dto';
import { UserSetGenreNameBodyDto, UserSetGenreNameQueryDto } from './set-genre-name.dto';
import { UserSetGenreNameService } from './set-genre-name.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetGenreNameController {
  constructor(private readonly setGenreNameService: UserSetGenreNameService) {}

  @Patch('set-genre-name')
  @ApiOperation({
    summary: `Set custom name for a genre, overriding the name embedded in tracks.`,
    description: [
      `Assigns a custom name to a genre, overriding the name embedded in tracks.`,
      `This affects all tracks categorized under the previous genre name.`,
      `The next indexing pass of the tracks will reflect the newly set custom name.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Custom data set successfully',
    type: UserSetCustomFileDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserSetCustomFileDataNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetCustomFileDataBadRequestResponseDto,
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
