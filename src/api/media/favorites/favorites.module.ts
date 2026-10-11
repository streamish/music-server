import { AlbumEntity, TrackEntity } from 'src/database/entities';
import { ApiFavoritesController } from './favorites.controller';
import { ApiFavoritesService } from './favorites.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature([AlbumEntity, TrackEntity])],
  controllers: [ApiFavoritesController],
  providers: [ApiFavoritesService],
})
export class ApiFavoritesModule {}
