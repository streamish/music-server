import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  FILTERED_DATA_DESCRIPTION,
  GUEST_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_BEARER_AUTH,
  PAGINATED_DATA_DESCRIPTION,
  TRACK_INFORMATION_EXCLUDED,
  TRACK_INFORMATION_INCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { AllowedRoles, RoleGuard } from './role.guard';
import {
  ApiBadRequestErrors,
  ApiNotFoundErrors,
  ApiUnauthorizedErrors,
  BadRequestResponseDto,
  ForbiddenErrorResponseDto,
  InternalServerErrorResponseDto,
} from './response.dto';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiHeaderOptions,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContentObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Controller, HttpCode, HttpStatus, Type, UseGuards, applyDecorators } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { UserRoleEnum } from 'src/types/enums';

export type ResponseDefinition =
  | {
      schema: SchemaObject;
    }
  | {
      description?: string;
      content: ContentObject;
    }
  | string[]
  | Type<unknown>
  | Type<unknown>[];

export type ResponseTypes = Partial<
  Record<
    | HttpStatus.OK
    | HttpStatus.CREATED
    | HttpStatus.BAD_REQUEST
    | HttpStatus.NOT_FOUND
    | HttpStatus.INTERNAL_SERVER_ERROR
    | HttpStatus.FORBIDDEN
    | HttpStatus.UNAUTHORIZED,
    ResponseDefinition
  >
>;

/**
 * Applies a common set of decorators to administrator endpoint controllers:
 * - set the path with \@Controller
 * - restrict access to administrators with \@UseGuards and \@AllowedRoles
 * - defines bearer authentication with \@ApiBearerAuth
 * - groups under the ADMIN_TAGS for Swagger with \@ApiTags
 *
 * This decorator consolidates common setup for admin controllers, ensuring
 * consistent security and documentation across the API.
 * @returns A decorator function that applies the common administrator controller setup.
 */
export function AdminController() {
  return applyDecorators(
    Controller({
      path: '/api/admin',
    }),
    ApiTags(ADMIN_APIS),
    ApiBearerAuth(JWT_BEARER_AUTH),
    UseGuards(RoleGuard),
    AllowedRoles([UserRoleEnum.ADMIN]),
  );
}

/**
 * Applies a common set of decorators to user endpoint controllers:
 * - set the path with \@Controller
 * - restrict access to users and administrators with \@UseGuards and \@AllowedRoles
 * - defines bearer authentication with \@ApiBearerAuth
 * - groups under the USER_APIS for Swagger with \@ApiTags
 *
 * This decorator consolidates common setup for user controllers, ensuring
 * consistent security and documentation across the API.
 * @returns A decorator function that applies the common user controller setup.
 */
export function UserController() {
  return applyDecorators(
    Controller({
      path: '/api/user',
    }),
    ApiTags(USER_APIS),
    ApiBearerAuth(JWT_BEARER_AUTH),
    UseGuards(RoleGuard),
    AllowedRoles([UserRoleEnum.ADMIN, UserRoleEnum.USER]),
  );
}

/**
 * Applies a common set of decorators to guest controllers:
 * - set the path with \@Controller
 * - allows access to all users (no role restrictions)
 * - groups under the GUEST_APIS for Swagger with \@ApiTags
 *
 * This decorator consolidates common setup for guest controllers, ensuring
 * consistent documentation across the API.
 * @returns A decorator function that applies the common guest controller setup.
 */
export function GuestController() {
  return applyDecorators(
    Controller({
      path: '/api/guest',
    }),
    ApiTags(GUEST_APIS),
  );
}

export function ApiEndpoint(
  httpVerb: (str: string) => MethodDecorator,
  urlPath: string,
  httpCode: HttpStatus,
  {
    summary,
    description,
    isAuthenticated,
    isAdministratorOnly,
    isPaginated,
    isFiltered,
    includeTrackInformation,
    excludeTrackInformation,
    header,
    responses,
    produces,
  }: {
    summary: string;
    description: string;
    isAuthenticated?: boolean;
    isAdministratorOnly?: boolean;
    isPaginated?: boolean;
    isFiltered?: boolean;
    includeTrackInformation?: boolean;
    excludeTrackInformation?: boolean;
    responses?: ResponseTypes;
    produces?: string[];
    header?: ApiHeaderOptions;
  },
) {
  const allResponses = {
    ...(responses || {}),
    [HttpStatus.BAD_REQUEST]: responses?.[HttpStatus.BAD_REQUEST] || BadRequestResponseDto,
    [HttpStatus.INTERNAL_SERVER_ERROR]: responses?.[HttpStatus.INTERNAL_SERVER_ERROR] || InternalServerErrorResponseDto,
    [HttpStatus.FORBIDDEN]: responses?.[HttpStatus.FORBIDDEN] || ForbiddenErrorResponseDto,
  };
  return applyDecorators(
    // request information
    httpVerb(urlPath),
    HttpCode(httpCode),
    // swagger information
    ApiOperation({
      summary,
      description: [
        description,
        ...(isAuthenticated ? [JWT_AUTHENTICATED_REQUEST_DESCRIPTION] : []),
        ...(isAdministratorOnly ? [ADMINISTRATOR_ONLY_ROUTE] : []),
        ...(isFiltered ? [FILTERED_DATA_DESCRIPTION] : []),
        ...(includeTrackInformation ? [TRACK_INFORMATION_INCLUDED] : []),
        ...(excludeTrackInformation ? [TRACK_INFORMATION_EXCLUDED] : []),
        ...(isPaginated ? [PAGINATED_DATA_DESCRIPTION] : []),
      ]
        .map((line) => line.trim())
        .join('\n\n'),
    }),
    // responses
    ...(produces ? [ApiProduces(...produces)] : []),
    ...(header ? [ApiHeader(header)] : []),
    ...Object.entries(allResponses).map(([status, dto]) => {
      if (status === '400' && Array.isArray(dto)) {
        return ApiBadRequestErrors(dto as ErrorCodes[]);
      }
      if (status === '401' && Array.isArray(dto)) {
        return ApiUnauthorizedErrors(dto as ErrorCodes[]);
      }
      if (status === '404' && Array.isArray(dto)) {
        return ApiNotFoundErrors(dto as ErrorCodes[]);
      }
      if ('schema' in dto) {
        return ApiResponse({ status: Number(status), schema: dto.schema });
      }
      if ('content' in dto) {
        return ApiResponse({ status: Number(status), content: dto.content, description: dto.description });
      }
      return ApiResponse({ status: Number(status), type: dto as Type<unknown> });
    }),
  );
}
