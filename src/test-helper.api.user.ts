import { USER_PASSWORD, USER_USERNAME, api } from './test-helper';
import { guestApi } from './test-helper.api.guest';
import { paths } from './types/api-schema';

type RequestParams = {
  header: {
    Authorization: string;
  };
};

type CreateRootPathBodyDto = paths['/api/user/create-root-path']['post']['requestBody']['content']['application/json'];

async function createRootPath(params: RequestParams, body: CreateRootPathBodyDto) {
  return api.POST(`/api/user/create-root-path`, {
    body,
    params,
  });
}

type DeleteCustomDataQueryDto = paths['/api/user/delete-custom-data']['delete']['parameters']['query'];

async function deleteCustomData(params: RequestParams, query: DeleteCustomDataQueryDto) {
  return api.DELETE(`/api/user/delete-custom-data`, {
    params: {
      ...params,
      query,
    },
  });
}

type DeleteFavoriteQueryDto = paths['/api/user/delete-favorite']['delete']['parameters']['query'];

async function deleteFavorite(params: RequestParams, query: DeleteFavoriteQueryDto) {
  return api.DELETE(`/api/user/delete-favorite`, {
    params: {
      ...params,
      query,
    },
  });
}

type DeleteRootPathQueryDto = paths['/api/user/delete-root-path']['delete']['parameters']['query'];

async function deleteRootPath(params: RequestParams, query: DeleteRootPathQueryDto) {
  return api.DELETE(`/api/user/delete-root-path`, {
    params: {
      ...params,
      query,
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

type ListFavoritesQueryDto = paths['/api/user/list-favorites']['get']['parameters']['query'];

async function listFavorites(params: RequestParams, query: ListFavoritesQueryDto) {
  return api.GET(`/api/user/list-favorites`, {
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

type SetAlbumFavoriteQueryDto = paths['/api/user/set-album-favorite']['put']['parameters']['query'];

async function setAlbumFavorite(params: RequestParams, query: SetAlbumFavoriteQueryDto) {
  return api.PUT(`/api/user/set-album-favorite`, {
    params: {
      ...params,
      query,
    },
  });
}

type SetAlbumRatingQueryDto = paths['/api/user/set-album-rating']['put']['parameters']['query'];
type SetAlbumRatingBodyDto = paths['/api/user/set-album-rating']['put']['requestBody']['content']['application/json'];

async function setAlbumRating(params: RequestParams, query: SetAlbumRatingQueryDto, body: SetAlbumRatingBodyDto) {
  return api.PUT(`/api/user/set-album-rating`, {
    body,
    params: {
      ...params,
      query,
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

type SetAssociationFavoriteQueryDto = paths['/api/user/set-association-favorite']['put']['parameters']['query'];

async function setAssociationFavorite(params: RequestParams, query: SetAssociationFavoriteQueryDto) {
  return api.PUT(`/api/user/set-association-favorite`, {
    params: {
      ...params,
      query,
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

type SetFolderFavoriteQueryDto = paths['/api/user/set-folder-favorite']['put']['parameters']['query'];

async function setFolderFavorite(params: RequestParams, query: SetFolderFavoriteQueryDto) {
  return api.PUT(`/api/user/set-folder-favorite`, {
    params: {
      ...params,
      query,
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

type SetTrackFavoriteQueryDto = paths['/api/user/set-track-favorite']['put']['parameters']['query'];

async function setTrackFavorite(params: RequestParams, query: SetTrackFavoriteQueryDto) {
  return api.PUT(`/api/user/set-track-favorite`, {
    params: {
      ...params,
      query,
    },
  });
}

type SetTrackRatingQueryDto = paths['/api/user/set-track-rating']['put']['parameters']['query'];
type SetTrackRatingBodyDto = paths['/api/user/set-track-rating']['put']['requestBody']['content']['application/json'];

async function setTrackRating(params: RequestParams, query: SetTrackRatingQueryDto, body: SetTrackRatingBodyDto) {
  return api.PUT(`/api/user/set-track-rating`, {
    body,
    params: {
      ...params,
      query,
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
  createRootPath: (body: CreateRootPathBodyDto) => ReturnType<typeof createRootPath>;
  deleteCustomData: (query: DeleteCustomDataQueryDto) => ReturnType<typeof deleteCustomData>;
  deleteFavorite: (query: DeleteFavoriteQueryDto) => ReturnType<typeof deleteFavorite>;
  deleteRootPath: (query: DeleteRootPathQueryDto) => ReturnType<typeof deleteRootPath>;
  endSession: () => ReturnType<typeof endSession>;
  folderStructure: () => ReturnType<typeof folderStructure>;
  listAlbums: (query?: ListAlbumsQueryDto) => ReturnType<typeof listAlbums>;
  listAlbumsWithTracks: (query?: ListAlbumsWithTracksQueryDto) => ReturnType<typeof listAlbumsWithTracks>;
  listAlbumAssociations: (query: ListAlbumAssociationsQueryDto) => ReturnType<typeof listAlbumAssociations>;
  listAlbumAssociationsWithTracks: (
    query: ListAlbumAssociationsWithTracksQueryDto,
  ) => ReturnType<typeof listAlbumAssociationsWithTracks>;
  listIndexerLogs: () => ReturnType<typeof listIndexerLogs>;
  listRootPaths: () => ReturnType<typeof listRootPaths>;
  listFavorites: (query: ListFavoritesQueryDto) => ReturnType<typeof listFavorites>;
  listTrackAssociations: (query: ListTrackAssociationsQueryDto) => ReturnType<typeof listTrackAssociations>;
  listTrackAssociationsWithTracks: (
    query: ListTrackAssociationsWithTracksQueryDto,
  ) => ReturnType<typeof listTrackAssociationsWithTracks>;
  listTracks: (query?: ListTracksQueryDto) => ReturnType<typeof listTracks>;
  regenerateSessionKey: () => ReturnType<typeof regenerateSessionKey>;
  setAlbumCustomData: (albumId: number, data: SetAlbumCustomDataBodyDto) => ReturnType<typeof setAlbumCustomData>;
  setAlbumFavorite: (query: SetAlbumFavoriteQueryDto) => ReturnType<typeof setAlbumFavorite>;
  setAlbumRating: (query: SetAlbumRatingQueryDto, body: SetAlbumRatingBodyDto) => ReturnType<typeof setAlbumRating>;
  setArtistName: (artistId: number, data: SetArtistNameBodyDto) => ReturnType<typeof setArtistName>;
  setAssociationFavorite: (query: SetAssociationFavoriteQueryDto) => ReturnType<typeof setAssociationFavorite>;
  setComposerName: (composerId: number, data: SetComposerNameBodyDto) => ReturnType<typeof setComposerName>;
  setCustomData: (customFileDataId: number, data: SetCustomFileDataBodyDto) => ReturnType<typeof setCustomData>;
  setFolderFavorite: (query: SetFolderFavoriteQueryDto) => ReturnType<typeof setFolderFavorite>;
  setGenreName: (genreId: number, data: SetGenreNameBodyDto) => ReturnType<typeof setGenreName>;
  setTrackCustomData: (
    trackCustomDataId: number,
    data: SetTrackCustomDataBodyDto,
  ) => ReturnType<typeof setTrackCustomData>;
  setTrackFavorite: (query: SetTrackFavoriteQueryDto) => ReturnType<typeof setTrackFavorite>;
  setTrackRating: (query: SetTrackRatingQueryDto, body: SetTrackRatingBodyDto) => ReturnType<typeof setTrackRating>;
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
    async createRootPath(body: CreateRootPathBodyDto) {
      return createRootPath(params, body);
    },
    async deleteCustomData(query: DeleteCustomDataQueryDto) {
      return deleteCustomData(params, query);
    },
    async deleteFavorite(query: DeleteFavoriteQueryDto) {
      return deleteFavorite(params, query);
    },
    async deleteRootPath(query: DeleteRootPathQueryDto) {
      return deleteRootPath(params, query);
    },
    async endSession() {
      return endSession(params);
    },
    async folderStructure() {
      return folderStructure(params);
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
    async listFavorites(query: ListFavoritesQueryDto) {
      return listFavorites(params, query);
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
    async setAlbumFavorite(query: SetAlbumFavoriteQueryDto) {
      return setAlbumFavorite(params, query);
    },
    async setAlbumRating(query: SetAlbumRatingQueryDto, body: SetAlbumRatingBodyDto) {
      return setAlbumRating(params, query, body);
    },
    async setArtistName(artistId: number, data: SetArtistNameBodyDto) {
      return setArtistName(params, artistId, data);
    },
    async setAssociationFavorite(query: SetAssociationFavoriteQueryDto) {
      return setAssociationFavorite(params, query);
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
    async setFolderFavorite(query: SetFolderFavoriteQueryDto) {
      return setFolderFavorite(params, query);
    },
    async setTrackRating(query: SetTrackRatingQueryDto, body: SetTrackRatingBodyDto) {
      return setTrackRating(params, query, body);
    },
    async setTrackCustomData(trackCustomDataId: number, data: SetTrackCustomDataBodyDto) {
      return setTrackCustomData(params, trackCustomDataId, data);
    },
    async setTrackFavorite(query: SetTrackFavoriteQueryDto) {
      return setTrackFavorite(params, query);
    },
    async updatePassword(newPassword: string) {
      return updatePassword(params, newPassword);
    },
  };
}
