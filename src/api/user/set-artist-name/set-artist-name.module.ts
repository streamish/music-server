import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetArtistNameController } from './set-artist-name.controller';
import { UserSetArtistNameService } from './set-artist-name.service';

@Module({
  imports: [CustomDataModule, LibraryModule],
  controllers: [UserSetArtistNameController],
  providers: [UserSetArtistNameService],
})
export class UserSetArtistNameModule {}
