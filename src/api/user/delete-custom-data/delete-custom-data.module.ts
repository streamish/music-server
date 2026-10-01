import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { TrackCustomDataEntity } from 'src/database/entities/track-custom-data.entity';
import { TrackEntity } from 'src/database/entities';
import { UserDeleteCustomDataController } from './delete-custom-data.controller';
import { UserDeleteCustomDataService } from './delete-custom-data.service';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity, TrackCustomDataEntity])],
  controllers: [UserDeleteCustomDataController],
  providers: [UserDeleteCustomDataService],
})
export class UserDeleteCustomDataModule {}
