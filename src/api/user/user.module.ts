/* eslint-disable max-len */
import { Module } from '@nestjs/common';
import { UserAlbumCoverImageModule } from './album-cover-image/album-cover-image.module';
import { UserAssociationCoverImageModule } from './association-cover-image/association-cover-image.module';
import { UserCreateRootPathModule } from './create-root-path/create-root-path.module';
import { UserDeleteCustomFileDataModule } from './delete-custom-file-data/delete-custom-file-data.module';
import { UserDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { UserEndSessionModule } from './end-session/end-session.module';
import { UserFolderStructureModule } from './folder-structure/folder-structure.module';
import { UserListAlbumAssociationsModule } from './list-album-associations/list-album-associations.module';
import { UserListAlbumAssociationsWithTracksModule } from './list-album-associations-with-tracks/list-album-associations-with-tracks.module';
import { UserListAlbumsModule } from './list-albums/list-albums.module';
import { UserListAlbumsWithTracksModule } from './list-albums-with-tracks/list-albums-with-tracks.module';
import { UserListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { UserListRootPathsModule } from './list-root-paths/list-root-paths.module';
import { UserListTrackAssociationsModule } from './list-track-associations/list-track-associations.module';
import { UserListTrackAssociationsWithTracksModule } from './list-track-associations-with-tracks/list-track-associations-with-tracks.module';
import { UserListTracksModule } from './list-tracks/list-tracks.module';
import { UserRegenerateSessionKeyModule } from './regenerate-session-key/regenerate-session-key.module';
import { UserRetrieveAlbumModule } from './retrieve-album/retrieve-album.module';
import { UserRetrieveAssociationModule } from './retrieve-association/retrieve-association.module';
import { UserSetAlbumCustomDataModule } from './set-album-custom-data/set-album-custom-data.module';
import { UserSetArtistNameModule } from './set-artist-name/set-artist-name.module';
import { UserSetComposerNameModule } from './set-composer-name/set-composer-name.module';
import { UserSetCustomFileDataModule } from './set-custom-file-data/set-custom-file-data.module';
import { UserSetGenreNameModule } from './set-genre-name/set-genre-name.module';
import { UserSetTrackCustomDataModule } from './set-track-custom-data/set-track-custom-data.module';
import { UserStreamFileModule } from './stream-file/stream-file.module';
import { UserUpdatePasswordModule } from './update-password/update-password.module';

@Module({
  imports: [
    UserAlbumCoverImageModule,
    UserAssociationCoverImageModule,
    UserCreateRootPathModule,
    UserDeleteCustomFileDataModule,
    UserDeleteRootPathModule,
    UserEndSessionModule,
    UserFolderStructureModule,
    UserListAlbumAssociationsModule,
    UserListAlbumAssociationsWithTracksModule,
    UserListAlbumsModule,
    UserListAlbumsWithTracksModule,
    UserListIndexerLogsModule,
    UserListRootPathsModule,
    UserListTrackAssociationsModule,
    UserListTrackAssociationsWithTracksModule,
    UserListTracksModule,
    UserRegenerateSessionKeyModule,
    UserRetrieveAlbumModule,
    UserRetrieveAssociationModule,
    UserSetAlbumCustomDataModule,
    UserSetArtistNameModule,
    UserSetComposerNameModule,
    UserSetCustomFileDataModule,
    UserSetGenreNameModule,
    UserSetTrackCustomDataModule,
    UserStreamFileModule,
    UserUpdatePasswordModule,
  ],
})
export class UserModule {}
