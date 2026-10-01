import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackAssociationsWithTracksController } from './list-track-associations-with-tracks.controller';
import { UserListTrackAssociationsWithTracksService } from './list-track-associations-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackAssociationsWithTracksController],
  providers: [UserListTrackAssociationsWithTracksService],
})
export class UserListTrackAssociationsWithTracksModule {}
