import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserSetAssociationFavoriteController } from './set-association-favorite.controller';
import { UserSetAssociationFavoriteService } from './set-association-favorite.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserSetAssociationFavoriteController],
  providers: [UserSetAssociationFavoriteService],
})
export class UserSetAssociationFavoriteModule {}
