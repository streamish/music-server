import { ApiPlaylistsController } from './playlists.controller';
import { ApiPlaylistsService } from './playlists.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { PlaylistsModule } from 'src/playlists/playlists.module';

@Module({
  imports: [LibraryModule, PlaylistsModule],
  controllers: [ApiPlaylistsController],
  providers: [ApiPlaylistsService],
})
export class ApiPlaylistsModule {}
