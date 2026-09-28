import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { UserSetCustomFileDataController } from './set-custom-file-data.controller';
import { UserSetCustomFileDataService } from './set-custom-file-data.service';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity, TrackCustomDataEntity])],
  controllers: [UserSetCustomFileDataController],
  providers: [UserSetCustomFileDataService],
})
export class UserSetCustomFileDataModule {}
