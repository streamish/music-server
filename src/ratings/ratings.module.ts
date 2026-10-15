import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackEntity } from '../database/entities';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity])],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
