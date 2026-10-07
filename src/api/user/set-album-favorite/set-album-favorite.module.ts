import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetAlbumFavoriteController } from './set-album-favorite.controller';
import { UserSetAlbumFavoriteService } from './set-album-favorite.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserSetAlbumFavoriteController],
  providers: [UserSetAlbumFavoriteService],
})
export class UserSetAlbumFavoriteModule {}
