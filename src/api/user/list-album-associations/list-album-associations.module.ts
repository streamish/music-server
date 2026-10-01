import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListAlbumAssociationsController } from './list-album-associations.controller';
import { UserListAlbumAssociationsService } from './list-album-associations.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListAlbumAssociationsController],
  providers: [UserListAlbumAssociationsService],
})
export class UserListAlbumAssociationsModule {}
