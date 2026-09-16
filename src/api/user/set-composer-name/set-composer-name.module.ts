import { CustomDataModule } from 'src/custom-data/custom-data.module';
import { Module } from '@nestjs/common';
import { UserSetComposerNameController } from './set-composer-name.controller';
import { UserSetComposerNameService } from './set-composer-name.service';

@Module({
  imports: [CustomDataModule],
  controllers: [UserSetComposerNameController],
  providers: [UserSetComposerNameService],
})
export class UserSetComposerNameModule {}
