/* eslint-disable max-classes-per-file */
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiProperty,
  ApiSchema,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsBoolean, IsNumber, IsString, getMetadataStorage } from 'class-validator';
import { applyDecorators } from '@nestjs/common/decorators/core/apply-decorators';

/**
 * The response data structure for requests that complete successfully unless they return
 * binary, files, etc.
 */
export class SuccessResponseDto {
  /**
   * The success being "true" indicates that the request completed.
   */
  @ApiProperty({
    type: 'boolean',
    format: 'constant',
    default: true,
  })
  @IsBoolean()
  declare readonly success: boolean;
}

/**
 * The response data of a paginated query
 */
export class PaginatedResponseDataDto {
  /*
   * The number of results to return from the query.
   */
  @IsNumber()
  declare limit: number;

  /*
   * The starting point of results returned for pagination within the total set of results.
   */
  @IsNumber()
  declare offset: number;

  /*
   * The total number of results
   */
  @IsNumber()
  declare total: number;
}

/**
 * The response data structure for requests that fail.
 */
export class FailedResponseDto {
  /**
   * General description of the error class
   */
  @ApiProperty()
  @IsString()
  declare error: string;

  /**
   * The success being "false" indicates that the request failed to complete.
   */
  @ApiProperty({
    type: 'boolean',
    default: false,
  })
  @IsBoolean()
  declare readonly success: boolean;
}

/**
 * The response data structure for requests that fail unexpectedly with an internal server error.
 */
export class InternalServerErrorResponseDto extends FailedResponseDto {
  /**
   * An internal error occurred that isn't handled by the API and doesn't have a more specific error
   * message defined.
   */
  @ApiProperty({
    enum: [ErrorCodes.INTERNAL_SERVER_ERROR],
    enumName: 'InternalServerErrorEnum',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
    isArray: true,
  })
  declare readonly message: ErrorCodes[];
}

/**
 * The response data structure for requests that fail with a validation or other supported error message.
 */
export class BadRequestResponseDto extends FailedResponseDto {
  /**
   * A bad request occurred due to validation or other issues with the submitted data.
   */
  @ApiProperty({
    enum: [ErrorCodes.BAD_REQUEST_ERROR],
    default: ErrorCodes.BAD_REQUEST_ERROR,
    enumName: 'BadRequestErrorEnum',
    isArray: true,
  })
  declare readonly message: ErrorCodes[];
}

/**
 * The response data structure for requests that fail with a validation or other supported error message.
 */
export class NotFoundResponseDto extends FailedResponseDto {
  /**
   * A not found error occurred due to the requested resource not being found.
   */
  @ApiProperty({
    enum: [ErrorCodes.NOT_FOUND_ERROR],
    default: ErrorCodes.NOT_FOUND_ERROR,
    enumName: 'NotFoundErrorEnum',
    isArray: true,
  })
  declare readonly message: ErrorCodes[];
}

/**
 * The response data structure for requests that fail unexpectedly with an internal server error.
 */
export class ForbiddenErrorResponseDto extends FailedResponseDto {
  /**
   * A forbidden error occurred due to the user not having the necessary permissions to access the resource.
   */
  @ApiProperty({
    enum: [ErrorCodes.FORBIDDEN_ERROR],
    enumName: 'ForbiddenErrorEnum',
    default: ErrorCodes.FORBIDDEN_ERROR,
    isArray: true,
  })
  declare readonly message: ErrorCodes[];
}

export function BadRequestResponseDtoFactory(schemaName: string, enumName: string, messages: ErrorCodes[]) {
  @ApiSchema({ name: schemaName })
  class BadRequestResponse extends FailedResponseDto {
    /**
     * A validation or other error occurred during the processing of the request.
     */
    @ApiProperty({
      isArray: true,
      enum: messages,
      enumName,
      default: messages[0],
    })
    declare readonly message: ErrorCodes[];
  }
  return BadRequestResponse;
}

export function NotFoundResponseDtoFactory(schemaName: string, enumName: string, messages: ErrorCodes[]) {
  @ApiSchema({ name: schemaName })
  class NotFoundResponse extends FailedResponseDto {
    /**
     * A resource ID was specified that does not exist or does not belong to your account.
     */
    @ApiProperty({
      isArray: true,
      enum: messages,
      enumName,
      default: messages[0],
    })
    declare readonly message: ErrorCodes[];
  }
  return NotFoundResponse;
}

export function UnauthorizedResponseDtoFactory(schemaName: string, enumName: string, messages: ErrorCodes[]) {
  @ApiSchema({ name: schemaName })
  class UnauthorizedResponse extends FailedResponseDto {
    /**
     * Authentication failed or the user does not have the necessary permissions to access the resource.
     */
    @ApiProperty({
      isArray: true,
      enum: messages,
      enumName,
      default: messages[0],
    })
    declare readonly message: ErrorCodes[];
  }
  return UnauthorizedResponse;
}

/**
 * Extracts the class validator exception messages from the DTO class.
 * @param dto The DTO class from which to extract validation messages.
 * @returns An array of error codes representing the validation messages.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getValidationMessages(dto: Function): ErrorCodes[] {
  const metadata = getMetadataStorage().getTargetValidationMetadatas(dto, '', false, false);
  return [
    ...new Set(
      metadata.map((item) => item.message).filter((message): message is ErrorCodes => typeof message === 'string'),
    ),
  ];
}

export function ApiNotFoundErrors(messages: ErrorCodes[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const baseName = target.constructor.name.replace(/Controller$/, '');
    const enumName = `${baseName}NotFoundErrors`;
    const schemaName = `${baseName}NotFoundResponse`;
    const ResponseDto = NotFoundResponseDtoFactory(schemaName, enumName, messages);
    applyDecorators(ApiExtraModels(ResponseDto), ApiNotFoundResponse({ type: ResponseDto }))(
      target,
      propertyKey,
      descriptor,
    );
  };
}

export function ApiBadRequestErrors(messages: ErrorCodes[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const baseName = target.constructor.name.replace(/Controller$/, '');
    const enumName = `${baseName}BadRequestErrors`;
    const schemaName = `${baseName}BadRequestResponse`;
    const ResponseDto = BadRequestResponseDtoFactory(schemaName, enumName, messages);
    applyDecorators(ApiExtraModels(ResponseDto), ApiBadRequestResponse({ type: ResponseDto }))(
      target,
      propertyKey,
      descriptor,
    );
  };
}

export function ApiUnauthorizedErrors(messages: ErrorCodes[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const baseName = target.constructor.name.replace(/Controller$/, '');
    const enumName = `${baseName}UnauthorizedErrors`;
    const schemaName = `${baseName}UnauthorizedResponse`;
    const ResponseDto = UnauthorizedResponseDtoFactory(schemaName, enumName, messages);
    applyDecorators(ApiExtraModels(ResponseDto), ApiUnauthorizedResponse({ type: ResponseDto }))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
