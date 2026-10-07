import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetTrackFavoriteController } from './set-track-favorite.controller';
import { UserSetTrackFavoriteService } from './set-track-favorite.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserSetTrackFavoriteController],
  providers: [UserSetTrackFavoriteService],
})
export class UserSetTrackFavoriteModule {}
