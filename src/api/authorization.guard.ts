import { AuthenticatedRequest } from 'src/types';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { Inject, Injectable, Logger, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/types/enums';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

export const AllowedRoles = (roles: UserRoleEnum[]) => SetMetadata('roles', roles);
export const AllowGuest = () => SetMetadata('allowGuest', true);

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthorizationGuard.name);

  constructor(
    private readonly authenticationService: AuthenticationService,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // confirm the route requires authorization
    const requireAuthorization = this.reflector.getAllAndOverride<boolean>('requireAuthorization', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requireAuthorization) {
      return true;
    }
    const { body, user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user?.id) {
      throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
    }
    // determine if expecting user password or admin
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    // administrator authorization required when changing features of an account
    if (requiredRoles?.length === 1 && requiredRoles[0] === UserRoleEnum.ADMIN) {
      // manually validate because the DTO validation doesn't occur until later
      if (!body.adminPassword?.length) {
        throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
      }
      if (body.adminPassword.length > 255) {
        throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_LENGTH_ERROR);
      }
      const isAdminPasswordValid = await this.authenticationService.verifyPassword(user.id, body.adminPassword);
      if (!isAdminPasswordValid) {
        throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
      }
      return true;
    }
    // user authorization applies to changing features of their own account
    if (!body.userPassword?.length) {
      throw new UnauthorizedException(ErrorCodes.INVALID_USER_PASSWORD_ERROR);
    }
    if (body.userPassword.length > 255) {
      throw new UnauthorizedException(ErrorCodes.INVALID_USER_PASSWORD_LENGTH_ERROR);
    }
    const isUserPasswordValid = await this.authenticationService.verifyPassword(user.id, body.userPassword);
    if (!isUserPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_USER_PASSWORD_ERROR);
    }
    return true;
  }
}
