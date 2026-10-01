import { AlbumEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserAlbumCoverImageController } from './album-cover-image.controller';
import { UserAlbumCoverImageService } from './album-cover-image.service';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [UserAlbumCoverImageController],
  providers: [UserAlbumCoverImageService],
})
export class UserAlbumCoverImageModule {}
