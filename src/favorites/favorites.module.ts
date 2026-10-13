import { AlbumEntity, AssociationEntity, FavoriteItemEntity, TrackEntity } from '../database/entities';
import { FavoritesService } from './favorites.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    LibraryModule,
    SequelizeModule.forFeature([AlbumEntity, AssociationEntity, FavoriteItemEntity, TrackEntity]),
  ],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
