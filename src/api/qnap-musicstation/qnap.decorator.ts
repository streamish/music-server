import { AllowGuest, AllowedRoles } from '../role.guard';
import {
  ApiExtraModels,
  ApiHeaderOptions,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { BadRequestResponseDto, ForbiddenErrorResponseDto, InternalServerErrorResponseDto } from '../response.dto';
import { Controller, Header, HttpCode, HttpStatus, Type, UseGuards, applyDecorators } from '@nestjs/common';
import { QNAP_AUTHENTICATED_REQUEST_DESCRIPTION, QNAP_MUSICSTATION_APIS, XML_MIME_TYPE } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { ResponseTypes } from '../api.decorator';
import { UserRoleEnum } from 'src/types/enums';

/**
 * Applies a common set of decorators to QNAP endpoint controllers:
 * - set the path with \@Controller
 * - restrict access to users and administrators with \@UseGuards and \@AllowedRoles
 * - groups under the QNAP_MUSICSTATION_APIS for Swagger with \@ApiTags
 *
 * This decorator consolidates common setup for QNAP endpoint controllers, ensuring
 * consistent security and documentation across the API.
 * @returns A decorator function that applies the common QNAP controller setup.
 */
export function QnapController(
  { allowGuest, path }: { allowGuest?: boolean; path?: string } = { allowGuest: false, path: '/cgi-bin' },
) {
  return applyDecorators(
    Controller({
      path: path || '/cgi-bin',
    }),
    ApiTags(QNAP_MUSICSTATION_APIS),
    ApiProduces(XML_MIME_TYPE),
    UseGuards(QnapGuard),
    ...(allowGuest ? [AllowGuest()] : [AllowedRoles([UserRoleEnum.ADMIN, UserRoleEnum.USER])]),
  );
}

export function QnapApiEndpoint(
  httpVerb: (str: string) => MethodDecorator,
  urlPath: string,
  httpCode: HttpStatus,
  {
    summary,
    description,
    isAuthenticated,
    responses,
    extraModels,
  }: {
    summary: string;
    description: string;
    isAuthenticated?: boolean;
    responses?: ResponseTypes;
    produces?: string[];
    header?: ApiHeaderOptions;
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
      description: [description, ...(isAuthenticated ? [QNAP_AUTHENTICATED_REQUEST_DESCRIPTION] : [])]
        .map((line) => line.trim())
        .join('\n'),
    }),
    // responses
    Header('Content-Type', 'application/xml'),
    ...Object.entries(allResponses).map(([status, dto]) => {
      if ('schema' in dto) {
        return ApiResponse({ status: Number(status), schema: dto.schema });
      }
      if ('content' in dto) {
        return ApiResponse({ status: Number(status), content: dto.content, description: dto.description });
      }
      if (Array.isArray(dto)) {
        return applyDecorators(
          ApiExtraModels(...dto),
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
  );
}
