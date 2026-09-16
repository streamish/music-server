import { paths } from './types/api-schema';
import createClient from 'openapi-fetch';

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
