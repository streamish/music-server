import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserDeleteFavoriteController } from './delete-favorite.controller';
import { UserDeleteFavoriteService } from './delete-favorite.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserDeleteFavoriteController],
  providers: [UserDeleteFavoriteService],
})
export class UserDeleteFavoriteModule {}
