import { SynologyApiEnum, SynologyMethodEnum, UserRoleEnum, components, paths } from './types/api-schema';
import createClient from 'openapi-fetch';
import crypto from 'node:crypto';
import xml2js from 'xml2js';

export const ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
export const USER_USERNAME = process.env.DEFAULT_USER_USERNAME || 'user';
export const USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'user';

export const unauthenticatedApi: ReturnType<typeof createClient<paths>> = createClient<paths>({
  baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
  credentials: 'include',
});

export type AuthenticatedApiClient = ReturnType<typeof createClient<paths>>;
export type QnapApiClient = AuthenticatedApiClient;
export type SynologyApiClient = AuthenticatedApiClient;

export const guestApi = {
  createSession: async (username: string, password: string) => {
    return unauthenticatedApi.POST(`/api/guest/create-session`, {
      body: {
        username,
        password,
      },
    });
  },
};

export const testApi = {
  createAccount: async (username?: string, password?: string, roles?: UserRoleEnum[]) => {
    const newUsername = username || `new-user-${Date.now()}`;
    const newRoles = roles || [UserRoleEnum.user];
    const { data } = await unauthenticatedApi.POST(`/api/test/create-account`, {
      body: {
        username: username || newUsername,
        password: password || USER_PASSWORD,
        roles: newRoles,
      },
    });
    return {
      id: data?.accountId || 0,
      username: data?.username || '',
      password: password || USER_PASSWORD,
      roles: newRoles,
    };
  },

  deleteAccount: async (id: number) => {
    return unauthenticatedApi.DELETE(`/api/test/delete-account`, {
      params: {
        query: {
          id,
        },
      },
    });
  },
  deleteAccounts: async (accountIds: number[]) => {
    for (let i = 0; i < accountIds.length; i += 1) {
      const accountId = accountIds[i];
      if (accountId) {
        // eslint-disable-next-line no-await-in-loop
        await testApi.deleteAccount(accountId);
      }
    }
  },
  duplicateAccount: async (username: string, newUsername: string) => {
    return unauthenticatedApi.POST(`/api/test/duplicate-account`, {
      params: {
        query: {
          username,
        },
      },
      body: {
        newUsername,
      },
    });
  },
  extraAdminsCleared: async () => {
    const accounts = await testApi.listAccounts();
    const adminUsers = accounts.filter((user) => user.roles.includes(UserRoleEnum.admin));
    if (adminUsers?.length === 1) {
      return true;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    return testApi.extraAdminsCleared();
  },
  listAccounts: async () => {
    const { data } = await unauthenticatedApi.GET(`/api/test/list-accounts`);
    const accounts = data?.accounts || [];
    return accounts;
  },
  retrieveAccount: async (username: string) => {
    const { data } = await unauthenticatedApi.GET(`/api/test/retrieve-account`, {
      params: {
        query: {
          username,
        },
      },
    });
    const account = data?.account || null;
    if (!account) {
      throw new Error(`Account with username "${username}" not found.`);
    }
    return account;
  },
};

export async function createAuthenticatedApi(
  username?: string,
  password?: string,
): Promise<ReturnType<typeof createClient<paths>>> {
  const ownUsername = username || ADMIN_USERNAME;
  const ownPassword = password || ADMIN_PASSWORD;
  const session = await guestApi.createSession(ownUsername, ownPassword);
  const jwtToken = session.data?.jwtToken;
  const client = createClient<paths>({
    baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });
  client.use({
    onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${jwtToken}`);
      return request;
    },
  });
  return client;
}

/**
 * Synology login credentials may be sent over HTTP across your network so they
 * implement an encryption mechanism to protect the credentials.
 * @param {string} username The Synology account username.
 * @param {string} password The Synology account password.
 * @param {string} publicKeyPem The Synology public key in PEM format.
 * @returns {string} The encrypted credentials as a base64-encoded string.
 */
export function encryptSynologyCredentials(username: string, password: string, publicKeyPem: string): string {
  const plaintext = `account=${username}&passwd=${password}`;
  const publicKeyData = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
  const publicKey = crypto.createPublicKey({
    key: publicKeyData,
    format: 'pem',
    type: 'spki',
  });
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(plaintext, 'utf8'),
  );
  return encrypted.toString('base64');
}

/**
 * Creates a Synology session cookie.
 * @param {string} username The Synology account username.
 * @param {string} password The Synology account password.
 * @returns {Promise<String>} The Synology session cookie as a string.
 */
export async function createSynologyCookie(username?: string, password?: string): Promise<string> {
  const encryptionKeyResponse = await unauthenticatedApi.POST(`/webapi/entry.cgi`, {
    body: {
      api: SynologyApiEnum.SYNO_API_Encryption,
      method: SynologyMethodEnum.getinfo,
      version: 1,
    },
  });
  const encryptionKey = encryptionKeyResponse?.data as components['schemas']['SynologyEntryCertificateResponseDto'];
  if (!encryptionKey?.data?.public_key?.length) {
    throw new Error(`Failed to get encryption key`);
  }
  // encrypt the payload
  const payload = encryptSynologyCredentials(
    username || ADMIN_USERNAME,
    password || ADMIN_PASSWORD,
    encryptionKey.data.public_key,
  );
  // do the sign in
  const signinResponse = await unauthenticatedApi.POST(`/webapi/entry.cgi`, {
    body: {
      __cIpHeRtExT: payload,
      client_time: encryptionKey.data.server_time,
    },
  });
  const signIn = signinResponse?.data as components['schemas']['SynologyEntrySignInResponseDto'];
  const sessionId = signIn.data.sid;
  const deviceId = signIn.data.did;
  return `id=${sessionId}; did=${deviceId}`;
}

/**
 * Creates an authenticated Synology API
 * @param {string} username The Synology account username.
 * @param {string} password The Synology account password.
 * @returns {Promise<SynologyApiClient>} The API client instance built on the OpenAPI specification
 */
export async function createSynologyApi(username?: string, password?: string): Promise<SynologyApiClient> {
  const cookie = await createSynologyCookie(username, password);
  return createClient<paths>({
    baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
    credentials: 'include',
    headers: {
      cookie,
    },
  });
}

/**
 * Creates an unauthenticated QNAP API.  This API returns XML by default so the API has
 * middleware configured to parse responses to JSON.
 * @param {string} username The QNAP account username.
 * @param {string} password The QNAP account password.
 * @returns {Promise<QnapApiClient>} The API client instance built on the OpenAPI specification
 */
export function createQnapApiWithXmlResponse(): QnapApiClient {
  const client = createClient<paths>({
    baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
    credentials: 'include',
  });
  client.use({
    async onResponse({ response }) {
      if (!response.body) {
        return response;
      }
      const bodyBuffer = await response.arrayBuffer();
      const bodyText = new TextDecoder('utf-8').decode(bodyBuffer);
      const isXml = /^\uFEFF?\s*<\?xml\b/i.test(bodyText);
      if (!isXml) {
        return new Response(bodyBuffer, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
      const parsedBody = await xml2js.parseStringPromise(bodyText, {
        explicitArray: false,
      });
      // Single-item responses are parsed as objects.
      if (parsedBody?.QDocRoot?.datas?.data && !Array.isArray(parsedBody.QDocRoot.datas.data)) {
        parsedBody.QDocRoot.datas.data = [parsedBody.QDocRoot.datas.data];
      }
      const jsonBody = parsedBody?.QDocRoot ? JSON.stringify(parsedBody.QDocRoot) : '';
      const headers = new Headers(response.headers);
      headers.set('content-type', 'application/json');
      return new Response(jsonBody, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    },
    async onError({ error }) {
      // wrap errors thrown by fetch
      return new Error('Oops, fetch failed', { cause: error });
    },
  });
  return client;
}

/**
 * Creates an authenticated QNAP API.  This API returns XML by default so the API has
 * middleware configured to parse responses to JSON.
 * @param {string} username The QNAP account username.
 * @param {string} password The QNAP account password.
 * @returns {Promise<QnapApiClient>} The API client instance built on the OpenAPI specification
 */
export async function createQnapApi(username?: string, password?: string): Promise<QnapApiClient> {
  let sid: string = '';
  const client = createQnapApiWithXmlResponse();
  client.use({
    onRequest({ request }) {
      if (sid) {
        const url = new URL(request.url);
        url.searchParams.set('sid', sid);
        return new Request(url, request);
      }
      return request;
    },
  });
  // do the sign in
  const clientId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const signinResponse = await client.GET(`/cgi-bin/authLogin.cgi`, {
    params: {
      query: {
        client_agent: 'jest test',
        client_app: 'Qmusic',
        client_id: clientId,
        force_to_check_2sv: 0,
        pwd: Buffer.from(password || ADMIN_PASSWORD).toString('base64'),
        remme: 1,
        serviceKey: 1,
        service: 1,
        user: username || ADMIN_USERNAME,
      },
    },
  });
  if (!signinResponse?.data) {
    throw new Error('Failed to sign in to QNAP API');
  }
  const data = signinResponse.data as { authSid: string };
  sid = data.authSid;
  return client;
}
