import { ApiAlbumsModule } from './albums/albums.module';
import { ApiAssociationsModule } from './associations/associations.module';
import { ApiCoverImageModule } from './cover-images/cover-images.module';
import { ApiCustomDataModule } from './custom-data/custom-data.module';
import { ApiFavoritesModule } from './favorites/favorites.module';
import { ApiFoldersModule } from './folders/folders.module';
import { ApiRatingsModule } from './ratings/ratings.module';
import { ApiTracksModule } from './tracks/tracks.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ApiAlbumsModule,
    ApiAssociationsModule,
    ApiCoverImageModule,
    ApiCustomDataModule,
    ApiFavoritesModule,
    ApiFoldersModule,
    ApiRatingsModule,
    ApiTracksModule,
  ],
})
export class ApiMediaModule {}
