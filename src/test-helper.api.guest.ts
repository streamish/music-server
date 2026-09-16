import { api } from './test-helper';

/**
 * Creates an unauthenticated guest API client
 * @returns Object with shortcut functions for Guest APIs
 */
export function createGuestApi() {
  return {
    async createSession(username: string, password: string, expiresDays?: number) {
      return api.POST(`/api/guest/create-session`, {
        body: {
          username,
          password,
          ...(expiresDays !== undefined ? { expiresDays } : {}),
        },
      });
    },
  };
}

export const guestApi = createGuestApi();
