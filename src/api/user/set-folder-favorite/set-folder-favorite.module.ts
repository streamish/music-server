import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetFolderFavoriteController } from './set-folder-favorite.controller';
import { UserSetFolderFavoriteService } from './set-folder-favorite.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserSetFolderFavoriteController],
  providers: [UserSetFolderFavoriteService],
})
export class UserSetFolderFavoriteModule {}
