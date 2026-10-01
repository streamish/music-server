import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackEntity } from 'src/database/entities';
import { UserSetTrackCustomDataController } from './set-track-custom-data.controller';
import { UserSetTrackCustomDataService } from './set-track-custom-data.service';

@Module({
  imports: [CustomDataModule, SequelizeModule.forFeature([TrackEntity])],
  controllers: [UserSetTrackCustomDataController],
  providers: [UserSetTrackCustomDataService],
})
export class UserSetTrackCustomDataModule {}
