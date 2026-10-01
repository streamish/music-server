import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListTrackAssociationsController } from './list-track-associations.controller';
import { UserListTrackAssociationsService } from './list-track-associations.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListTrackAssociationsController],
  providers: [UserListTrackAssociationsService],
})
export class UserListTrackAssociationsModule {}
