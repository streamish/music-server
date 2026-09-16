import { CustomDataService } from './custom-data.service';
import { FileCustomDataEntity, FileEntity } from 'src/database/entities';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([FileEntity, FileCustomDataEntity]), LibraryModule],
  providers: [CustomDataService],
  exports: [CustomDataService],
})
export class CustomDataModule {}
