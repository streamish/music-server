import {
  AlbumEntity,
  AssociationEntity,
  FavoriteItemEntity,
  FolderEntity,
  ShoutcastStationEntity,
  TrackEntity,
} from '../database/entities';
import { FavoritesService } from './favorites.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AlbumEntity,
      AssociationEntity,
      FavoriteItemEntity,
      FolderEntity,
      ShoutcastStationEntity,
      TrackEntity,
    ]),
  ],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
