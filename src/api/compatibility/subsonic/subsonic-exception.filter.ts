import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { sendSubsonicError } from './subsonic-error';
import type { Request, Response } from 'express';

@Catch()
export class SubsonicExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SubsonicExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    this.logger.error(
      `Failed Subsonic request: ${request.method} ${request.path}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    sendSubsonicError(exception, request, response);
  }
}
