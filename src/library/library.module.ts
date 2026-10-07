import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  PlaylistEntity,
  TrackEntity,
} from '../database/entities';
import { LibraryService } from './library.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AlbumEntity,
      AssociationEntity,
      AssociationLinkEntity,
      FavoriteItemEntity,
      PlaylistEntity,
      TrackEntity,
    ]),
  ],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
