import { ApiTracksController } from './tracks.controller';
import { ApiTracksService } from './tracks.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { StreamingModule } from 'src/streaming/streaming.module';

@Module({
  imports: [LibraryModule, StreamingModule],
  controllers: [ApiTracksController],
  providers: [ApiTracksService],
  exports: [ApiTracksService],
})
export class ApiTracksModule {}
