import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  PlaylistEntity,
  ShoutcastStationEntity,
  TrackEntity,
} from '../database/entities';
import { LibraryQueryService } from './query.service';
import { LibraryService } from './library.service';
import { LibraryTransformerService } from './transformer.service';
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
      ShoutcastStationEntity,
      TrackEntity,
    ]),
  ],
  providers: [LibraryService, LibraryQueryService, LibraryTransformerService],
  exports: [LibraryService, LibraryTransformerService],
})
export class LibraryModule {}
