import { AccountEntity } from 'src/database/entities';
import { AdminController, ApiEndpoint } from '../../api.decorator';
import {
  AdminUpdateUserRolesBodyDto,
  AdminUpdateUserRolesQueryDto,
  AdminUpdateUserRolesResponseDto,
} from './update-user-roles.dto';
import { AdminUpdateUserRolesService } from './update-user-roles.service';
import { Body, HttpStatus, Patch, Query } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { User } from 'src/api/user.decorator';
import { getValidationMessages } from 'src/api/response.dto';

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
      [HttpStatus.NOT_FOUND]: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
      [HttpStatus.BAD_REQUEST]: [
        ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR,
        ...getValidationMessages(AdminUpdateUserRolesQueryDto),
        ...getValidationMessages(AdminUpdateUserRolesBodyDto),
      ],
      [HttpStatus.UNAUTHORIZED]: [ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR],
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
