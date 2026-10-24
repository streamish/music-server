import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

export const ResponseFormat = createParamDecorator((_data: unknown, context: ExecutionContext): boolean => {
  const request = context.switchToHttp().getRequest<Request>();
  const queryFormat = request.query.f;
  if (queryFormat === 'json' || queryFormat === 'xml') {
    return queryFormat === 'json';
  }
  const accept = request.headers.accept ?? '';
  return accept.includes('application/json');
});
