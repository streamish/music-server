import { AlbumEntity, AssociationEntity, AssociationLinkEntity, TrackEntity } from '../database/entities';
import { LibraryService } from './library.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity, AssociationEntity, AssociationLinkEntity, TrackEntity])],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
