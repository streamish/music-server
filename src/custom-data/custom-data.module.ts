import { CustomDataService } from './custom-data.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity, TrackCustomDataEntity]), LibraryModule],
  providers: [CustomDataService],
  exports: [CustomDataService],
})
export class CustomDataModule {}
