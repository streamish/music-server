import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../../../test-helper';

export interface SubsonicEnvelope<T> {
  'subsonic-response': {
    status: 'ok' | 'failed';
    version: string;
    error?: {
      code: number;
      message: string;
    };
  } & T;
}

export function createSubsonicParams(overrides: Record<string, string> = {}): URLSearchParams {
  return new URLSearchParams({
    u: ADMIN_USERNAME,
    p: ADMIN_PASSWORD,
    v: '1.16.1',
    c: 'jest',
    f: 'json',
    ...overrides,
  });
}

export async function requestSubsonic(endpoint: string, params = createSubsonicParams()): Promise<Response> {
  const url = new URL(`/rest/${endpoint}.view`, `http://localhost:${process.env.SERVER_PORT}`);
  url.search = params.toString();
  return fetch(url);
}

export async function getSubsonicResponse<T>(
  endpoint: string,
  params = createSubsonicParams(),
): Promise<{ response: Response; body: SubsonicEnvelope<T> }> {
  const response = await requestSubsonic(endpoint, params);
  const body = (await response.json()) as SubsonicEnvelope<T>;
  return { response, body };
}
