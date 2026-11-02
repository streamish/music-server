import { ApiAlbumsModule } from './albums/albums.module';
import { ApiAssociationsModule } from './associations/associations.module';
import { ApiFoldersModule } from './folders/folders.module';
import { ApiTracksModule } from './tracks/tracks.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [ApiAlbumsModule, ApiAssociationsModule, ApiFoldersModule, ApiTracksModule],
})
export class ApiMediaModule {}
