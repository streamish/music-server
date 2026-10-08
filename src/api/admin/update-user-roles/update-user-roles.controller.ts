import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminUpdateUserRolesBadRequestResponseDto,
  AdminUpdateUserRolesBodyDto,
  AdminUpdateUserRolesNotFoundResponseDto,
  AdminUpdateUserRolesQueryDto,
  AdminUpdateUserRolesResponseDto,
} from './update-user-roles.dto';
import { AdminUpdateUserRolesService } from './update-user-roles.service';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';

@AdminController()
export class AdminUpdateUserRolesController {
  constructor(private readonly updateRolesService: AdminUpdateUserRolesService) {}

  @ApiEndpoint(Patch, 'update-user-roles', HttpStatus.OK, {
    summary: 'Update user roles',
    description: 'Updates the roles of a specified user account.',
    isAuthenticated: true,
    isAdministratorOnly: true,
    responses: {
      [HttpStatus.OK]: AdminUpdateUserRolesResponseDto,
      [HttpStatus.BAD_REQUEST]: AdminUpdateUserRolesBadRequestResponseDto,
      [HttpStatus.NOT_FOUND]: AdminUpdateUserRolesNotFoundResponseDto,
    },
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: AdminUpdateUserRolesQueryDto,
    @Body() body: AdminUpdateUserRolesBodyDto,
  ): Promise<AdminUpdateUserRolesResponseDto> {
    await this.updateRolesService.updateUserRoles(user.id, body.adminPassword, query.id, body.roles);
    return {
      success: true,
    };
  }
}
