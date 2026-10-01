import { AlbumEntity } from 'src/database/entities/album.entity';
import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserSetAlbumCustomDataController } from './set-album-custom-data.controller';
import { UserSetAlbumCustomDataService } from './set-album-custom-data.service';

@Module({
  imports: [CustomDataModule, SequelizeModule.forFeature([AlbumEntity])],
  controllers: [UserSetAlbumCustomDataController],
  providers: [UserSetAlbumCustomDataService],
})
export class UserSetAlbumCustomDataModule {}
