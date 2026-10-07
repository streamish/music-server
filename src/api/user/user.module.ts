/* eslint-disable max-len */
import { Module } from '@nestjs/common';
import { UserAlbumCoverImageModule } from './album-cover-image/album-cover-image.module';
import { UserAssociationCoverImageModule } from './association-cover-image/association-cover-image.module';
import { UserCreateRootPathModule } from './create-root-path/create-root-path.module';
import { UserDeleteCustomDataModule } from './delete-custom-data/delete-custom-data.module';
import { UserDeleteFavoriteModule } from './delete-favorite/delete-favorite.module';
import { UserDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { UserEndSessionModule } from './end-session/end-session.module';
import { UserFolderStructureModule } from './folder-structure/folder-structure.module';
import { UserListAlbumAssociationsModule } from './list-album-associations/list-album-associations.module';
import { UserListAlbumAssociationsWithTracksModule } from './list-album-associations-with-tracks/list-album-associations-with-tracks.module';
import { UserListAlbumsModule } from './list-albums/list-albums.module';
import { UserListAlbumsWithTracksModule } from './list-albums-with-tracks/list-albums-with-tracks.module';
import { UserListFavoritesModule } from './list-favorites/list-favorites.module';
import { UserListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { UserListRootPathsModule } from './list-root-paths/list-root-paths.module';
import { UserListTrackAssociationsModule } from './list-track-associations/list-track-associations.module';
import { UserListTrackAssociationsWithTracksModule } from './list-track-associations-with-tracks/list-track-associations-with-tracks.module';
import { UserListTracksModule } from './list-tracks/list-tracks.module';
import { UserRegenerateSessionKeyModule } from './regenerate-session-key/regenerate-session-key.module';
import { UserRetrieveAlbumModule } from './retrieve-album/retrieve-album.module';
import { UserRetrieveAssociationModule } from './retrieve-association/retrieve-association.module';
import { UserSetAlbumCustomDataModule } from './set-album-custom-data/set-album-custom-data.module';
import { UserSetAlbumFavoriteModule } from './set-album-favorite/set-album-favorite.module';
import { UserSetAlbumRatingModule } from './set-album-rating/set-album-rating.module';
import { UserSetArtistNameModule } from './set-artist-name/set-artist-name.module';
import { UserSetAssociationFavoriteModule } from './set-association-favorite/set-association-favorite.module';
import { UserSetComposerNameModule } from './set-composer-name/set-composer-name.module';
import { UserSetCustomDataModule } from './set-custom-data/set-custom-data.module';
import { UserSetFolderFavoriteModule } from './set-folder-favorite/set-folder-favorite.module';
import { UserSetGenreNameModule } from './set-genre-name/set-genre-name.module';
import { UserSetTrackCustomDataModule } from './set-track-custom-data/set-track-custom-data.module';
import { UserSetTrackFavoriteModule } from './set-track-favorite/set-track-favorite.module';
import { UserSetTrackRatingModule } from './set-track-rating/set-track-rating.module';
import { UserStreamFileModule } from './stream-file/stream-file.module';
import { UserUpdatePasswordModule } from './update-password/update-password.module';

@Module({
  imports: [
    UserAlbumCoverImageModule,
    UserAssociationCoverImageModule,
    UserCreateRootPathModule,
    UserDeleteCustomDataModule,
    UserDeleteFavoriteModule,
    UserDeleteRootPathModule,
    UserEndSessionModule,
    UserFolderStructureModule,
    UserListAlbumAssociationsModule,
    UserListAlbumAssociationsWithTracksModule,
    UserListAlbumsModule,
    UserListAlbumsWithTracksModule,
    UserListFavoritesModule,
    UserListIndexerLogsModule,
    UserListRootPathsModule,
    UserListTrackAssociationsModule,
    UserListTrackAssociationsWithTracksModule,
    UserListTracksModule,
    UserRegenerateSessionKeyModule,
    UserRetrieveAlbumModule,
    UserRetrieveAssociationModule,
    UserSetAlbumCustomDataModule,
    UserSetAlbumFavoriteModule,
    UserSetAlbumRatingModule,
    UserSetArtistNameModule,
    UserSetAssociationFavoriteModule,
    UserSetComposerNameModule,
    UserSetCustomDataModule,
    UserSetFolderFavoriteModule,
    UserSetGenreNameModule,
    UserSetTrackFavoriteModule,
    UserSetTrackRatingModule,
    UserSetTrackCustomDataModule,
    UserStreamFileModule,
    UserUpdatePasswordModule,
  ],
})
export class UserModule {}
