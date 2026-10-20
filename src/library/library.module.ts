import {
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  FolderEntity,
  PlaylistEntity,
  RootPathEntity,
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
      FolderEntity,
      PlaylistEntity,
      RootPathEntity,
      ShoutcastStationEntity,
      TrackEntity,
    ]),
  ],
  providers: [LibraryService, LibraryQueryService, LibraryTransformerService],
  exports: [LibraryService, LibraryTransformerService],
})
export class LibraryModule {}
