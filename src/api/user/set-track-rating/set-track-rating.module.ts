import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetTrackRatingController } from './set-track-rating.controller';
import { UserSetTrackRatingService } from './set-track-rating.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserSetTrackRatingController],
  providers: [UserSetTrackRatingService],
})
export class UserSetTrackRatingModule {}
