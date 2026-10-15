import { ApiRatingsController } from './ratings.controller';
import { ApiRatingsService } from './ratings.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { RatingsModule } from 'src/ratings/ratings.module';

@Module({
  imports: [LibraryModule, RatingsModule],
  controllers: [ApiRatingsController],
  providers: [ApiRatingsService],
})
export class ApiRatingsModule {}
