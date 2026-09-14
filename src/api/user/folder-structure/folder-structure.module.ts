import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserFolderStructureController } from './folder-structure.controller';
import { UserFolderStructureService } from './folder-structure.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserFolderStructureController],
  providers: [UserFolderStructureService],
})
export class UserFolderStructureModule {}
