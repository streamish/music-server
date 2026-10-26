import { SubsonicApiClient, createSubsonicApi } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { paths } from '../../../types/api-schema';

describe('/rest/ping', () => {
  let api: SubsonicApiClient;

  async function ping(params: Record<string, string> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await api.GET('/rest/ping', { params: { query: params } } as any);
    // note: 'any' is used because the authentication and response parameters are not defined
    // on the endpoint but are required for all endpoints.  The reason for this is defining
    // them on each request would then make every typed-request have to populate them manually
    // and every controller would need a @Query() to capture them so they are present in
    // the OpenAPI spec.
    const typedData = data as paths['/rest/ping']['get']['responses']['200']['content']['application/json'];
    return { data: typedData['subsonic-response'], error };
  }

  beforeAll(async () => {
    api = await createSubsonicApi();
    if (!process.env.SERVER_PORT) {
      throw new Error('SERVER_PORT must be set to run Subsonic compatibility tests');
    }
  });

  it('should return a successful JSON response', async () => {
    const { data, error } = await ping();
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
    expect(data).toMatchObject({
      status: 'ok',
      version: '1.16.1',
    });
  });

  it('should return a successful XML response when requested', async () => {
    const { data, error } = await ping({ f: 'xml' });
    expect(error).toBeUndefined();
    expect(data).toBeDefined();
  });

  it('should report the missing username', async () => {
    const { data } = await ping({ f: 'json', v: '1.16.1', c: 'jest', u: '' });
    expect(data).toMatchObject({
      status: 'failed',
      error: {
        code: 10,
        message: 'Required parameter is missing: u',
      },
    });
  });

  it('should reject an invalid password', async () => {
    const { data } = await ping({ f: 'json', v: '1.16.1', c: 'jest', p: 'invalid' });
    expect(data).toMatchObject({
      status: 'failed',
      error: {
        code: 40,
        message: 'Wrong username or password',
      },
    });
  });

  it('should accept a hex-encoded password', async () => {
    const password = Buffer.from(process.env.DEFAULT_ADMIN_PASSWORD || 'admin').toString('hex');
    const { data } = await ping({ f: 'json', v: '1.16.1', c: 'jest', p: `enc:${password}` });
    expect(data.status).toBe('ok');
  });

  it('should reject unsupported token authentication', async () => {
    const { data } = await ping({ f: 'json', v: '1.16.1', c: 'jest', p: '', s: 'salt', t: 'token' });
    expect(data).toMatchObject({
      status: 'failed',
      error: { code: 42 },
    });
  });

  it('should reject conflicting authentication mechanisms', async () => {
    const { data } = await ping({ f: 'json', v: '1.16.1', c: 'jest', s: 'salt', t: 'token' });
    expect(data).toMatchObject({
      status: 'failed',
      error: { code: 43 },
    });
  });
});
