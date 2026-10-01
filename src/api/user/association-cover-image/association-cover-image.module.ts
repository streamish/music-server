import { AlbumEntity, TrackEntity } from 'src/database/entities';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserAssociationCoverImageController } from './association-cover-image.controller';
import { UserAssociationCoverImageService } from './association-cover-image.service';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature([AlbumEntity, TrackEntity])],
  controllers: [UserAssociationCoverImageController],
  providers: [UserAssociationCoverImageService],
})
export class UserAssociationCoverImageModule {}
