import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { TrackCustomDataEntity } from 'src/database/entities/track-custom-data.entity';
import { TrackEntity } from 'src/database/entities';
import { UserDeleteCustomFileDataController } from './delete-custom-file-data.controller';
import { UserDeleteCustomFileDataService } from './delete-custom-file-data.service';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity, TrackCustomDataEntity])],
  controllers: [UserDeleteCustomFileDataController],
  providers: [UserDeleteCustomFileDataService],
})
export class UserDeleteCustomFileDataModule {}
