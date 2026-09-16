import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { UserSetGenreNameController } from './set-genre-name.controller';
import { UserSetGenreNameService } from './set-genre-name.service';

@Module({
  imports: [CustomDataModule],
  controllers: [UserSetGenreNameController],
  providers: [UserSetGenreNameService],
})
export class UserSetGenreNameModule {}
