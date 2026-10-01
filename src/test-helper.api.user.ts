import { USER_PASSWORD, USER_USERNAME, api } from './test-helper';
import { guestApi } from './test-helper.api.guest';
import { paths } from './types/api-schema';

type RequestParams = {
  header: {
    Authorization: string;
  };
};

async function createRootPath(params: RequestParams, rootPath: string) {
  return api.POST(`/api/user/create-root-path`, {
    body: {
      rootPath,
    },
    params,
  });
}

async function deleteCustomFileData(params: RequestParams, customFileDataId: number) {
  return api.DELETE(`/api/user/delete-custom-data`, {
    params: {
      ...params,
      query: {
        id: customFileDataId,
      },
    },
  });
}

async function deleteRootPath(params: RequestParams, rootPathId: number) {
  return api.DELETE(`/api/user/delete-root-path`, {
    params: {
      ...params,
      query: {
        id: rootPathId,
      },
    },
  });
}

async function endSession(params: RequestParams) {
  return api.DELETE(`/api/user/end-session`, {
    params,
  });
}

async function folderStructure(params: RequestParams) {
  return api.GET(`/api/user/folder-structure`, {
    params,
  });
}

type ListAlbumsQueryDto = paths['/api/user/list-albums']['get']['parameters']['query'];

async function listAlbums(params: RequestParams, query?: ListAlbumsQueryDto) {
  return api.GET(`/api/user/list-albums`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumsWithTracksQueryDto = paths['/api/user/list-albums-with-tracks']['get']['parameters']['query'];

async function listAlbumsWithTracks(params: RequestParams, query?: ListAlbumsWithTracksQueryDto) {
  return api.GET(`/api/user/list-albums-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumAssociationsQueryDto = paths['/api/user/list-album-associations']['get']['parameters']['query'];

async function listAlbumAssociations(params: RequestParams, query: ListAlbumAssociationsQueryDto) {
  return api.GET(`/api/user/list-album-associations`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumAssociationsWithTracksQueryDto =
  paths['/api/user/list-album-associations-with-tracks']['get']['parameters']['query'];

async function listAlbumAssociationsWithTracks(params: RequestParams, query: ListAlbumAssociationsWithTracksQueryDto) {
  return api.GET(`/api/user/list-album-associations-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

async function listIndexerLogs(params: RequestParams) {
  return api.GET(`/api/user/list-indexer-logs`, {
    params,
  });
}

async function listRootPaths(params: RequestParams) {
  return api.GET(`/api/user/list-root-paths`, {
    params,
  });
}

type ListTrackAssociationsQueryDto = paths['/api/user/list-track-associations']['get']['parameters']['query'];

async function listTrackAssociations(params: RequestParams, query: ListTrackAssociationsQueryDto) {
  return api.GET(`/api/user/list-track-associations`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTrackAssociationsWithTracksQueryDto =
  paths['/api/user/list-track-associations-with-tracks']['get']['parameters']['query'];

async function listTrackAssociationsWithTracks(params: RequestParams, query: ListTrackAssociationsWithTracksQueryDto) {
  return api.GET(`/api/user/list-track-associations-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListTracksQueryDto = paths['/api/user/list-tracks']['get']['parameters']['query'];

async function listTracks(params: RequestParams, query?: ListTracksQueryDto) {
  return api.GET(`/api/user/list-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

async function regenerateSessionKey(params: RequestParams) {
  return api.POST(`/api/user/regenerate-session-key`, {
    params,
  });
}

type SetAlbumCustomDataBodyDto =
  paths['/api/user/set-album-custom-data']['patch']['requestBody']['content']['application/json'];

async function setAlbumCustomData(params: RequestParams, albumCustomDataId: number, body: SetAlbumCustomDataBodyDto) {
  return api.PATCH(`/api/user/set-album-custom-data`, {
    body,
    params: {
      ...params,
      query: {
        id: albumCustomDataId,
      },
    },
  });
}

type SetArtistNameBodyDto = paths['/api/user/set-artist-name']['patch']['requestBody']['content']['application/json'];

async function setArtistName(params: RequestParams, artistId: number, body: SetArtistNameBodyDto) {
  return api.PATCH(`/api/user/set-artist-name`, {
    body,
    params: {
      ...params,
      query: {
        id: artistId,
      },
    },
  });
}

type SetComposerNameBodyDto =
  paths['/api/user/set-composer-name']['patch']['requestBody']['content']['application/json'];

async function setComposerName(params: RequestParams, composerId: number, body: SetComposerNameBodyDto) {
  return api.PATCH(`/api/user/set-composer-name`, {
    body,
    params: {
      ...params,
      query: {
        id: composerId,
      },
    },
  });
}

type SetCustomFileDataBodyDto = paths['/api/user/set-custom-data']['put']['requestBody']['content']['application/json'];

async function setCustomData(params: RequestParams, customFileDataId: number, body: SetCustomFileDataBodyDto) {
  return api.PUT(`/api/user/set-custom-data`, {
    body,
    params: {
      ...params,
      query: {
        id: customFileDataId,
      },
    },
  });
}

type SetGenreNameBodyDto = paths['/api/user/set-genre-name']['patch']['requestBody']['content']['application/json'];

async function setGenreName(params: RequestParams, genreId: number, body: SetGenreNameBodyDto) {
  return api.PATCH(`/api/user/set-genre-name`, {
    body,
    params: {
      ...params,
      query: {
        id: genreId,
      },
    },
  });
}

type SetTrackCustomDataBodyDto =
  paths['/api/user/set-track-custom-data']['patch']['requestBody']['content']['application/json'];

async function setTrackCustomData(params: RequestParams, trackCustomDataId: number, body: SetTrackCustomDataBodyDto) {
  return api.PATCH(`/api/user/set-track-custom-data`, {
    body,
    params: {
      ...params,
      query: {
        id: trackCustomDataId,
      },
    },
  });
}

async function updatePassword(params: RequestParams, newPassword: string) {
  return api.POST(`/api/user/update-password`, {
    body: {
      newPassword,
    },
    params,
  });
}

export type UserApi = {
  createRootPath: (rootPath: string) => ReturnType<typeof createRootPath>;
  deleteCustomFileData: (customFileDataId: number) => ReturnType<typeof deleteCustomFileData>;
  deleteRootPath: (rootPathId: number) => ReturnType<typeof deleteRootPath>;
  endSession: () => ReturnType<typeof endSession>;
  listAlbums: (query?: ListAlbumsQueryDto) => ReturnType<typeof listAlbums>;
  listAlbumsWithTracks: (query?: ListAlbumsWithTracksQueryDto) => ReturnType<typeof listAlbumsWithTracks>;
  listAlbumAssociations: (query: ListAlbumAssociationsQueryDto) => ReturnType<typeof listAlbumAssociations>;
  listAlbumAssociationsWithTracks: (
    query: ListAlbumAssociationsWithTracksQueryDto,
  ) => ReturnType<typeof listAlbumAssociationsWithTracks>;
  folderStructure: () => ReturnType<typeof folderStructure>;
  listIndexerLogs: () => ReturnType<typeof listIndexerLogs>;
  listRootPaths: () => ReturnType<typeof listRootPaths>;
  listTrackAssociations: (query: ListTrackAssociationsQueryDto) => ReturnType<typeof listTrackAssociations>;
  listTrackAssociationsWithTracks: (
    query: ListTrackAssociationsWithTracksQueryDto,
  ) => ReturnType<typeof listTrackAssociationsWithTracks>;
  listTracks: (query?: ListTracksQueryDto) => ReturnType<typeof listTracks>;
  regenerateSessionKey: () => ReturnType<typeof regenerateSessionKey>;
  setAlbumCustomData: (albumId: number, data: SetAlbumCustomDataBodyDto) => ReturnType<typeof setAlbumCustomData>;
  setArtistName: (artistId: number, data: SetArtistNameBodyDto) => ReturnType<typeof setArtistName>;
  setComposerName: (composerId: number, data: SetComposerNameBodyDto) => ReturnType<typeof setComposerName>;
  setCustomData: (customFileDataId: number, data: SetCustomFileDataBodyDto) => ReturnType<typeof setCustomData>;
  setGenreName: (genreId: number, data: SetGenreNameBodyDto) => ReturnType<typeof setGenreName>;
  setTrackCustomData: (
    trackCustomDataId: number,
    data: SetTrackCustomDataBodyDto,
  ) => ReturnType<typeof setTrackCustomData>;
  updatePassword: (newPassword: string) => ReturnType<typeof updatePassword>;
};

/**
 * Creates an authenticated user API client with the provided username and password or
 * the default user.
 * @param {string | undefined} username Optional username for the user account. Defaults to the default user username.
 * @param {string | undefined} password Optional password for the user account. Defaults to the default user password.
 * @returns {Promise<UserApi>} Object with shortcut functions for User APIs using a session token of from
 * the provided credentials.
 */
export async function createUserApi(username?: string, password?: string): Promise<UserApi> {
  const session = await guestApi.createSession(username || USER_USERNAME, password || USER_PASSWORD);
  const jwtToken = session.data?.jwtToken;
  const params = {
    header: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  return {
    async createRootPath(rootPath: string) {
      return createRootPath(params, rootPath);
    },
    async deleteCustomFileData(customFileDataId: number) {
      return deleteCustomFileData(params, customFileDataId);
    },
    async deleteRootPath(rootPathId: number) {
      return deleteRootPath(params, rootPathId);
    },
    async endSession() {
      return endSession(params);
    },
    async listAlbums(query?: ListAlbumsQueryDto) {
      return listAlbums(params, query);
    },
    async listAlbumsWithTracks(query?: ListAlbumsWithTracksQueryDto) {
      return listAlbumsWithTracks(params, query);
    },
    async listAlbumAssociations(query: ListAlbumAssociationsQueryDto) {
      return listAlbumAssociations(params, query);
    },
    async listAlbumAssociationsWithTracks(query: ListAlbumAssociationsWithTracksQueryDto) {
      return listAlbumAssociationsWithTracks(params, query);
    },
    async folderStructure() {
      return folderStructure(params);
    },
    async listIndexerLogs() {
      return listIndexerLogs(params);
    },
    async listRootPaths() {
      return listRootPaths(params);
    },
    async listTrackAssociations(query: ListTrackAssociationsQueryDto) {
      return listTrackAssociations(params, query);
    },
    async listTrackAssociationsWithTracks(query: ListTrackAssociationsWithTracksQueryDto) {
      return listTrackAssociationsWithTracks(params, query);
    },
    async listTracks(query?: ListTracksQueryDto) {
      return listTracks(params, query);
    },
    async regenerateSessionKey() {
      return regenerateSessionKey(params);
    },
    async setAlbumCustomData(albumId: number, data: SetAlbumCustomDataBodyDto) {
      return setAlbumCustomData(params, albumId, data);
    },
    async setArtistName(artistId: number, data: SetArtistNameBodyDto) {
      return setArtistName(params, artistId, data);
    },
    async setComposerName(composerId: number, data: SetComposerNameBodyDto) {
      return setComposerName(params, composerId, data);
    },
    async setGenreName(genreId: number, data: SetGenreNameBodyDto) {
      return setGenreName(params, genreId, data);
    },
    async setCustomData(customFileDataId: number, data: SetCustomFileDataBodyDto) {
      return setCustomData(params, customFileDataId, data);
    },
    async setTrackCustomData(trackCustomDataId: number, data: SetTrackCustomDataBodyDto) {
      return setTrackCustomData(params, trackCustomDataId, data);
    },
    async updatePassword(newPassword: string) {
      return updatePassword(params, newPassword);
    },
  };
}
