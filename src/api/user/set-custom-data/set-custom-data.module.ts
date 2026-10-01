import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackCustomDataEntity, TrackEntity } from 'src/database/entities';
import { UserSetCustomDataController } from './set-custom-data.controller';
import { UserSetCustomDataService } from './set-custom-data.service';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity, TrackCustomDataEntity])],
  controllers: [UserSetCustomDataController],
  providers: [UserSetCustomDataService],
})
export class UserSetCustomDataModule {}
