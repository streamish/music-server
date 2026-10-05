import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetAlbumRatingController } from './set-album-rating.controller';
import { UserSetAlbumRatingService } from './set-album-rating.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserSetAlbumRatingController],
  providers: [UserSetAlbumRatingService],
})
export class UserSetAlbumRatingModule {}
