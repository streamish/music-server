import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  FILTERED_DATA_DESCRIPTION,
  GUEST_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_BEARER_AUTH,
  PAGINATED_DATA_DESCRIPTION,
  TEST_APIS,
  TRACK_INFORMATION_EXCLUDED,
  TRACK_INFORMATION_INCLUDED,
  USER_APIS,
} from 'src/constants/swagger';
import { AllowGuest, AllowedRoles, RoleGuard } from './role.guard';
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
import { ErrorCodes } from 'src/constants/error-codes';
import { HttpCode, HttpStatus, Type, UseGuards, applyDecorators } from '@nestjs/common';
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

export function ApiEndpoint(
  httpVerb: (str: string) => MethodDecorator,
  urlPath: string,
  httpCode: HttpStatus,
  {
    allowAdministrator,
    allowGuest,
    allowUser,
    description,
    excludeTrackInformation,
    header,
    includeTrackInformation,
    isFiltered,
    isPaginated,
    isTest,
    produces,
    responses,
    summary,
  }: {
    allowAdministrator?: boolean;
    allowGuest?: boolean;
    allowUser?: boolean;
    description: string;
    excludeTrackInformation?: boolean;
    header?: ApiHeaderOptions;
    includeTrackInformation?: boolean;
    isFiltered?: boolean;
    isPaginated?: boolean;
    isTest?: boolean;
    produces?: string[];
    responses?: ResponseTypes;
    summary: string;
  },
) {
  const allResponses = {
    ...(responses || {}),
    [HttpStatus.BAD_REQUEST]: responses?.[HttpStatus.BAD_REQUEST] || BadRequestResponseDto,
    [HttpStatus.INTERNAL_SERVER_ERROR]: responses?.[HttpStatus.INTERNAL_SERVER_ERROR] || InternalServerErrorResponseDto,
    [HttpStatus.FORBIDDEN]: responses?.[HttpStatus.FORBIDDEN] || ForbiddenErrorResponseDto,
  };
  const apiTags: string[] = [];
  const allowedRoles: UserRoleEnum[] = [];
  if (isTest) {
    apiTags.push(TEST_APIS);
  } else {
    if (allowAdministrator) {
      allowedRoles.push(UserRoleEnum.ADMIN);
      apiTags.push(ADMIN_APIS);
    }
    if (allowUser) {
      allowedRoles.push(UserRoleEnum.USER);
      if (!allowAdministrator) {
        apiTags.push(USER_APIS);
      }
    }
    if (allowGuest) {
      apiTags.push(GUEST_APIS);
    }
  }
  const isAuthenticated = allowAdministrator || allowUser;
  return applyDecorators(
    // request information
    httpVerb(urlPath),
    HttpCode(httpCode),
    // security
    ...(allowGuest ? [AllowGuest] : []),
    ...(isAuthenticated ? [ApiBearerAuth(JWT_BEARER_AUTH), UseGuards(RoleGuard), AllowedRoles(allowedRoles)] : []),
    // swagger information
    ApiTags(...apiTags),
    ApiOperation({
      summary,
      description: [
        description,
        ...(isAuthenticated ? [JWT_AUTHENTICATED_REQUEST_DESCRIPTION] : []),
        ...(allowAdministrator ? [ADMINISTRATOR_ONLY_ROUTE] : []),
        ...(isFiltered ? [FILTERED_DATA_DESCRIPTION] : []),
        ...(includeTrackInformation ? [TRACK_INFORMATION_INCLUDED] : []),
        ...(excludeTrackInformation ? [TRACK_INFORMATION_EXCLUDED] : []),
        ...(isPaginated ? [PAGINATED_DATA_DESCRIPTION] : []),
        ...(isTest ? ['This API endpoint only exists when `NODE_ENV` is set to `test`.'] : []),
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
