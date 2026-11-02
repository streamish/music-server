import { AlbumEntity, PlaylistEntity, PlaylistItemEntity, TrackEntity } from 'src/database/entities';
import { CoverImagesService } from './cover-images.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature([AlbumEntity, PlaylistEntity, PlaylistItemEntity, TrackEntity])],
  providers: [CoverImagesService],
  exports: [CoverImagesService],
})
export class CoverImagesModule {}
