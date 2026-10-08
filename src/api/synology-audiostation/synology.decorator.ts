import { AllowGuest, AllowedRoles } from '../role.guard';
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiHeaderOptions,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BadRequestResponseDto, ForbiddenErrorResponseDto, InternalServerErrorResponseDto } from '../response.dto';
import { Controller, Header, HttpCode, HttpStatus, Type, UseGuards, applyDecorators } from '@nestjs/common';
import {
  JSON_MIME_TYPE,
  PAGINATED_DATA_DESCRIPTION,
  SYNOLOGY_AUDIOSTATION_APIS,
  SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
  SYNOLOGY_COOKIE_HEADER,
} from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import { UserRoleEnum } from 'src/types/enums';
import type { ResponseTypes } from '../api.decorator';

/**
 * Applies a common set of decorators to Synology endpoint controllers:
 * - set the path with \@Controller
 * - restrict access to users and administrators with \@UseGuards and \@AllowedRoles
 * - groups under the SYNOLOGY_AUDIOSTATION_APIS for Swagger with \@ApiTags
 *
 * This decorator consolidates common setup for Synology endpoint controllers, ensuring
 * consistent security and documentation across the API.
 * @returns A decorator function that applies the common Synology controller setup.
 */
export function SynologyController({ allowGuest }: { allowGuest?: boolean } = { allowGuest: false }) {
  return applyDecorators(
    Controller({
      path: '/webapi',
    }),
    ApiTags(SYNOLOGY_AUDIOSTATION_APIS),
    ApiHeader(SYNOLOGY_COOKIE_HEADER),
    ApiProduces(JSON_MIME_TYPE),
    UseGuards(SynologyGuard),
    ...(allowGuest ? [AllowGuest()] : [AllowedRoles([UserRoleEnum.ADMIN, UserRoleEnum.USER])]),
  );
}

export function SynologyApiEndpoint(
  httpVerb: (str: string) => MethodDecorator,
  urlPath: string,
  httpCode: HttpStatus,
  {
    summary,
    description,
    isAuthenticated,
    isPaginated,
    responses,
    bodyModels,
    extraModels,
  }: {
    summary: string;
    description: string;
    isAuthenticated?: boolean;
    isPaginated?: boolean;
    responses?: ResponseTypes;
    produces?: string[];
    header?: ApiHeaderOptions;
    bodyModels?: Type<unknown>[];
    extraModels?: Type<unknown>[];
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
        ...(isPaginated ? [PAGINATED_DATA_DESCRIPTION] : []),
        ...(isAuthenticated ? [SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION] : []),
      ]
        .map((line) => line.trim())
        .join('\n\n'),
    }),
    // responses
    Header('Content-Type', 'application/json'),
    ...Object.entries(allResponses).map(([status, dto]) => {
      if ('schema' in dto) {
        return ApiResponse({ status: Number(status), schema: dto.schema });
      }
      if ('content' in dto) {
        return ApiResponse({ status: Number(status), content: dto.content, description: dto.description });
      }
      if (Array.isArray(dto)) {
        return applyDecorators(
          ApiExtraModels(...(dto as Type<unknown>[])),
          ApiResponse({
            status: Number(status),
            schema: {
              oneOf: dto.map((model) => ({
                $ref: getSchemaPath(model),
              })),
            },
          }),
        );
      }
      return ApiResponse({ status: Number(status), type: dto });
    }),
    ...(extraModels ? [ApiExtraModels(...extraModels)] : []),
    ...(bodyModels
      ? [
          applyDecorators(
            ApiExtraModels(...bodyModels),
            ApiBody({
              schema: {
                oneOf: bodyModels.map((model) => ({
                  $ref: getSchemaPath(model),
                })),
              },
            }),
          ),
        ]
      : []),
  );
}
