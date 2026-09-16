import { api } from './test-helper';

/**
 * Creates an unauthenticated guest API client
 * @returns Object with shortcut functions for Test APIs
 */
export function createTestApi() {
  return {
    async duplicateAccount(username: string, newUsername: string) {
      return api.POST(`/api/test/duplicate-account`, {
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

    async deleteAccount(id: number) {
      return api.DELETE(`/api/test/delete-account`, {
        params: {
          query: {
            id,
          },
        },
      });
    },
  };
}

export const testApi = createTestApi();
