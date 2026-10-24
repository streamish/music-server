import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

export enum SubsonicErrorCode {
  GENERIC = 0,
  REQUIRED_PARAMETER_MISSING = 10,
  INCOMPATIBLE_PROTOCOL_VERSION = 20,
  SERVER_UPGRADE_REQUIRED = 30,
  WRONG_USERNAME_OR_PASSWORD = 40,
  TOKEN_AUTHENTICATION_NOT_SUPPORTED = 41,
  AUTHENTICATION_MECHANISM_NOT_SUPPORTED = 42,
  CONFLICTING_AUTHENTICATION_MECHANISMS = 43,
  INVALID_API_KEY = 44,
  NOT_AUTHORIZED = 50,
  TRIAL_PERIOD_OVER = 60,
  DATA_NOT_FOUND = 70,
}

export class SubsonicException extends Error {
  constructor(
    readonly code: SubsonicErrorCode,
    message: string,
  ) {
    super(message);
    this.name = SubsonicException.name;
  }
}

export interface SubsonicErrorResponse {
  'subsonic-response': {
    status: 'failed';
    version: '1.16.1';
    error: {
      code: SubsonicErrorCode;
      message: string;
    };
  };
}

function hasMissingParameter(exception: HttpException, request: Request): boolean {
  const response = exception.getResponse();
  const messages =
    typeof response === 'object' && response !== null
      ? (response as { message?: string | string[] }).message
      : undefined;
  const messageList = typeof messages === 'string' ? [messages] : (messages ?? []);
  return messageList.some((message) => {
    const parameter = /^(\w+) (?:must|should) /.exec(message)?.[1];
    return parameter !== undefined && !Object.hasOwn(request.query, parameter);
  });
}

function getSubsonicError(exception: unknown, request: Request): SubsonicErrorResponse['subsonic-response']['error'] {
  if (exception instanceof SubsonicException) {
    return { code: exception.code, message: exception.message };
  }
  if (exception instanceof HttpException) {
    if (exception.getStatus() === HttpStatus.UNAUTHORIZED) {
      return {
        code: SubsonicErrorCode.WRONG_USERNAME_OR_PASSWORD,
        message: 'Wrong username or password',
      };
    }
    if (exception.getStatus() === HttpStatus.FORBIDDEN) {
      return {
        code: SubsonicErrorCode.NOT_AUTHORIZED,
        message: 'User is not authorized for the given operation',
      };
    }
    if (exception.getStatus() === HttpStatus.NOT_FOUND) {
      return {
        code: SubsonicErrorCode.DATA_NOT_FOUND,
        message: 'The requested data was not found',
      };
    }
    if (exception.getStatus() === HttpStatus.BAD_REQUEST) {
      return hasMissingParameter(exception, request)
        ? {
            code: SubsonicErrorCode.REQUIRED_PARAMETER_MISSING,
            message: 'Required parameter is missing',
          }
        : {
            code: SubsonicErrorCode.GENERIC,
            message: 'Invalid parameter',
          };
    }
  }
  return {
    code: SubsonicErrorCode.GENERIC,
    message: 'A generic error',
  };
}

function wantsJson(request: Request): boolean {
  const format = request.query.f;
  if (format === 'json' || format === 'xml') {
    return format === 'json';
  }
  return (request.headers.accept ?? '').includes('application/json');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function sendSubsonicError(exception: unknown, request: Request, response: Response): void {
  const error = getSubsonicError(exception, request);
  const payload: SubsonicErrorResponse = {
    'subsonic-response': {
      status: 'failed',
      version: '1.16.1',
      error,
    },
  };

  response.status(HttpStatus.OK);
  if (wantsJson(request)) {
    response.setHeader('Content-Type', 'application/json');
    response.json(payload);
    return;
  }

  response.setHeader('Content-Type', 'application/xml');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    `<subsonic-response status="failed" version="1.16.1"><error code="${error.code}" `,
    `message="${escapeXml(error.message)}"/></subsonic-response>`,
  ].join('');
  response.send(xml);
}
