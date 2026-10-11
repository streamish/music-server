import { AlbumEntity, TrackEntity } from 'src/database/entities';
import { ApiCoverImageController } from './cover-images.controller';
import { ApiCoverImageService } from './cover-images.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature([AlbumEntity, TrackEntity])],
  controllers: [ApiCoverImageController],
  providers: [ApiCoverImageService],
})
export class ApiCoverImageModule {}
