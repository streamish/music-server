import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { UserSetAlbumCustomDataController } from './set-album-custom-data.controller';
import { UserSetAlbumCustomDataService } from './set-album-custom-data.service';

@Module({
  imports: [CustomDataModule],
  controllers: [UserSetAlbumCustomDataController],
  providers: [UserSetAlbumCustomDataService],
})
export class UserSetAlbumCustomDataModule {}
