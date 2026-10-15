import { AlbumEntity, AssociationEntity, TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { ApiCustomDataController } from './custom-data.controller';
import { ApiCustomDataService } from './custom-data.service';
import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    CustomDataModule,
    LibraryModule,
    SequelizeModule.forFeature([AlbumEntity, AssociationEntity, TrackEntity, TrackCustomDataEntity]),
  ],
  controllers: [ApiCustomDataController],
  providers: [ApiCustomDataService],
})
export class ApiCustomDataModule {}
