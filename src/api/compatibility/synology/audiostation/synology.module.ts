import { CoverImagesModule } from 'src/cover-images/cover-images.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { PlaylistsModule } from 'src/playlists/playlists.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShoutcastModule } from 'src/shoutcast/shoutcast.module';
import { StreamingModule } from 'src/streaming/streaming.module';
import { SynologyAlbumController } from './album.controller';
import { SynologyAlbumService } from './album.service';
import { SynologyArtistController } from './artist.controller';
import { SynologyArtistService } from './artist.service';
import { SynologyComposerController } from './composer.controller';
import { SynologyComposerService } from './composer.service';
import { SynologyCoverImageController } from './cover-image.controller';
import { SynologyCoverImageService } from './cover-image.service';
import { SynologyEntryController } from './entry.controller';
import { SynologyEntryService } from './entry.service';
import { SynologyFolderController } from './folder.controller';
import { SynologyFolderService } from './folder.service';
import { SynologyGenreController } from './genre.controller';
import { SynologyGenreService } from './genre.service';
import { SynologyInfoController } from './info.controller';
import { SynologyInfoService } from './info.service';
import { SynologyLyricsController } from './lyrics.controller';
import { SynologyPlaylistController } from './playlist.controller';
import { SynologyPlaylistService } from './playlist.service';
import { SynologyProxyController } from './proxy.controller';
import { SynologyProxyService } from './proxy.service';
import { SynologyQueryController } from './query.controller';
import { SynologyQueryService } from './query.service';
import { SynologyRadioController } from './radio.controller';
import { SynologyRadioService } from './radio.service';
import { SynologyRemotePlayerController } from './remote-player.controller';
import { SynologySearchController } from './search.controller';
import { SynologySearchService } from './search.service';
import { SynologySongController } from './song.controller';
import { SynologySongService } from './song.service';
import { SynologyStreamController } from './stream.controller';
import { entitiesList } from 'src/database/entities';

@Module({
  imports: [
    CoverImagesModule,
    FavoritesModule,
    LibraryModule,
    PlaylistsModule,
    RatingsModule,
    SequelizeModule.forFeature(entitiesList),
    ShoutcastModule,
    StreamingModule,
  ],
  controllers: [
    SynologyAlbumController,
    SynologyArtistController,
    SynologyComposerController,
    SynologyCoverImageController,
    SynologyEntryController,
    SynologyFolderController,
    SynologyGenreController,
    SynologyInfoController,
    SynologyLyricsController,
    SynologyPlaylistController,
    SynologyProxyController,
    SynologyQueryController,
    SynologyRadioController,
    SynologyRemotePlayerController,
    SynologySearchController,
    SynologySongController,
    SynologyStreamController,
  ],
  providers: [
    SynologyAlbumService,
    SynologyArtistService,
    SynologyComposerService,
    SynologyCoverImageService,
    SynologyEntryService,
    SynologyFolderService,
    SynologyGenreService,
    SynologyInfoService,
    SynologyPlaylistService,
    SynologyProxyService,
    SynologyQueryService,
    SynologyRadioService,
    SynologySearchService,
    SynologySongService,
  ],
})
export class SynologyModule {}
