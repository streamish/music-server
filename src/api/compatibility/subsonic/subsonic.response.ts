import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

export function formatResponse(responsePayload: Record<string, unknown>, jsonResponse: boolean, res: Response) {
  if (jsonResponse) {
    res.setHeader('Content-Type', 'application/json');
    return {
      'subsonic-response': {
        status: 'ok',
        version: '1.16.1',
        ...responsePayload,
      },
    };
  }
  res.setHeader('Content-Type', 'application/xml');
  return objectToXml({ ...responsePayload }, 'subsonic-response');
}
