import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { UserSetTrackCustomDataController } from './set-track-custom-data.controller';
import { UserSetTrackCustomDataService } from './set-track-custom-data.service';

@Module({
  imports: [CustomDataModule],
  controllers: [UserSetTrackCustomDataController],
  providers: [UserSetTrackCustomDataService],
})
export class UserSetTrackCustomDataModule {}
