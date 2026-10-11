import { ApiRatingsController } from './ratings.controller';
import { ApiRatingsService } from './ratings.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [LibraryModule],
  controllers: [ApiRatingsController],
  providers: [ApiRatingsService],
})
export class ApiRatingsModule {}
