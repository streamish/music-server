import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StreamingService } from './streaming.service';
import { TrackEntity } from 'src/database/entities';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity])],
  providers: [StreamingService],
  exports: [StreamingService],
})
export class StreamingModule {}
