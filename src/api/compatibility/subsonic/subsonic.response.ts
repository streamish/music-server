import { objectToXml } from 'src/utils/xml';
import type { Response } from 'express';

export function formatResponse(responsePayload: Record<string, unknown>, isJsonResponse: boolean, res: Response) {
  const responseData = {
    status: 'ok',
    version: '1.16.1',
    ...responsePayload,
  };
  if (isJsonResponse) {
    res.setHeader('Content-Type', 'application/json');
    return {
      'subsonic-response': {
        ...responseData,
      },
    };
  }
  res.setHeader('Content-Type', 'application/xml');
  return objectToXml(responseData, 'subsonic-response');
}
