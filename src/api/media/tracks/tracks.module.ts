import { ApiTracksController } from './tracks.controller';
import { ApiTracksService } from './tracks.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackEntity } from 'src/database/entities';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature([TrackEntity])],
  controllers: [ApiTracksController],
  providers: [ApiTracksService],
})
export class ApiTracksModule {}
