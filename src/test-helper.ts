import { SynologyApiEnum, SynologyMethodEnum, components, paths } from './types/api-schema';
import createClient from 'openapi-fetch';
import crypto from 'node:crypto';

export const ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
export const USER_USERNAME = process.env.DEFAULT_USER_USERNAME || 'user';
export const USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'user';

export const api: ReturnType<typeof createClient<paths>> = createClient<paths>({
  baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
  credentials: 'include',
});

export * from './test-helper.api.admin';
export * from './test-helper.api.user';
export * from './test-helper.api.guest';
export * from './test-helper.api.test';

export type SynologyApiClient = ReturnType<typeof createClient<paths>>;

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
  const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
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
  const signinResponse = await api.POST(`/webapi/entry.cgi`, {
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
