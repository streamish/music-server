import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListFavoritesController } from './list-favorites.controller';
import { UserListFavoritesService } from './list-favorites.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListFavoritesController],
  providers: [UserListFavoritesService],
})
export class UserListFavoritesModule {}
