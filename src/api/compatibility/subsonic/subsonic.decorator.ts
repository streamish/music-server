import {
  ApiExtraModels,
  ApiHeaderOptions,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Controller,
  ExecutionContext,
  Header,
  HttpCode,
  HttpStatus,
  Type,
  UseFilters,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import {
  JSON_MIME_TYPE,
  SUBSONIC_APIS,
  SUBSONIC_AUTHENTICATED_REQUEST_DESCRIPTION,
  XML_MIME_TYPE,
} from 'src/constants/swagger';
import { ResponseTypes } from 'src/api/api.decorator';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { SubsonicGuard } from './subsonic.guard';
import type { Request } from 'express';

export const IsJsonResponse = createParamDecorator((_data: unknown, context: ExecutionContext): boolean => {
  const request = context.switchToHttp().getRequest<Request>();
  const queryFormat = request.query.f;
  if (queryFormat === 'json' || queryFormat !== 'xml') {
    return true;
  }
  const accept = request.headers.accept ?? '';
  return accept.includes('application/json');
});

export function SubsonicController({ path }: { path?: string } = { path: '/rest' }) {
  return applyDecorators(
    Controller({
      path: path || '/rest',
    }),
    ApiTags(SUBSONIC_APIS),
    ApiProduces(JSON_MIME_TYPE, XML_MIME_TYPE),
    UseFilters(SubsonicExceptionFilter),
    UseGuards(SubsonicGuard),
  );
}

export function SubsonicApiEndpoint(
  httpVerb: (str: string | string[]) => MethodDecorator,
  urlPath: string | string[],
  httpCode: HttpStatus,
  {
    summary,
    description,
    responses,
    extraModels,
  }: {
    summary: string;
    description: string;
    responses?: ResponseTypes;
    produces?: string[];
    header?: ApiHeaderOptions;
    extraModels?: Type<unknown>[];
  },
) {
  const urlPaths = Array.isArray(urlPath) ? urlPath : [urlPath];
  const allResponses = {
    ...(responses || {}),
    // [HttpStatus.BAD_REQUEST]: responses?.[HttpStatus.BAD_REQUEST] || BadRequestResponseDto,
    // [HttpStatus.INTERNAL_SERVER_ERROR]: responses?.[HttpStatus.INTERNAL_SERVER_ERROR] ||
    //   InternalServerErrorResponseDto,
    // [HttpStatus.FORBIDDEN]: responses?.[HttpStatus.FORBIDDEN] || ForbiddenErrorResponseDto,
  };
  return applyDecorators(
    // request information
    httpVerb(urlPaths.flatMap((path) => [path, `${path}.view`])),
    HttpCode(httpCode),
    // swagger information
    ApiOperation({
      summary,
      description: [description, SUBSONIC_AUTHENTICATED_REQUEST_DESCRIPTION].map((line) => line.trim()).join('\n\n'),
    }),
    // responses
    Header('server', 'Jetty(6.1.x)'),
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
  );
}
