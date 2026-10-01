import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListAlbumAssociationsWithTracksController } from './list-album-associations-with-tracks.controller';
import { UserListAlbumAssociationsWithTracksService } from './list-album-associations-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListAlbumAssociationsWithTracksController],
  providers: [UserListAlbumAssociationsWithTracksService],
})
export class UserListAlbumAssociationsWithTracksModule {}
