import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { UserSetArtistNameController } from './set-artist-name.controller';
import { UserSetArtistNameService } from './set-artist-name.service';

@Module({
  imports: [CustomDataModule],
  controllers: [UserSetArtistNameController],
  providers: [UserSetArtistNameService],
})
export class UserSetArtistNameModule {}
