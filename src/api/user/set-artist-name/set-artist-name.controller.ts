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
import { UserSetArtistNameBodyDto, UserSetArtistNameQueryDto } from './set-artist-name.dto';
import { UserSetArtistNameService } from './set-artist-name.service';
import {
  UserSetCustomFileDataBadRequestResponseDto,
  UserSetCustomFileDataNotFoundResponseDto,
  UserSetCustomFileDataResponseDto,
} from '../set-custom-file-data/set-custom-file-data.dto';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetArtistNameController {
  constructor(private readonly setArtistNameService: UserSetArtistNameService) {}

  @Patch('set-artist-name')
  @ApiOperation({
    summary: `Set custom name for an artist, overriding the name embedded in albums.`,
    description: [
      `Assigns a custom name to an artist, overriding the name embedded in albums.`,
      `This affects all tracks and albums the artist is credited on under the previous name.`,
      `The next indexing pass of the albums will reflect the newly set custom name.`,
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
    @Query() query: UserSetArtistNameQueryDto,
    @Body() body: UserSetArtistNameBodyDto,
  ) {
    await this.setArtistNameService.setArtistName(user.id, query.id, body.name);
    return {
      success: true,
    };
  }
}
