import { CoverImagesModule } from 'src/cover-images/cover-images.module';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { StreamingModule } from 'src/streaming/streaming.module';
import { SubsonicAlbumController } from './get-album.controller';
import { SubsonicAlbumInfoController } from './get-album-info.controller';
import { SubsonicAlbumInfoService } from './get-album-info.service';
import { SubsonicAlbumListController } from './get-album-list.controller';
import { SubsonicAlbumListService } from './get-album-list.service';
import { SubsonicAlbumService } from './get-album.service';
import { SubsonicArtistController } from './get-artist.controller';
import { SubsonicArtistService } from './get-artist.service';
import { SubsonicArtistsController } from './get-artists.controller';
import { SubsonicArtistsService } from './get-artists.service';
import { SubsonicBookmarksController } from './get-bookmarks.controller';
import { SubsonicCoverArtController } from './get-cover-art.controller';
import { SubsonicExceptionFilter } from './subsonic-exception.filter';
import { SubsonicGenresController } from './get-genres.controller';
import { SubsonicGenresService } from './get-genres.service';
import { SubsonicIndexesController } from './get-indexes.controller';
import { SubsonicIndexesService } from './get-indexes.service';
import { SubsonicInternetRadioStationsController } from './get-internet-radio-stations.controller';
import { SubsonicLicenseController } from './get-license.controller';
import { SubsonicMusicDirectoryController } from './get-music-directory.controller';
import { SubsonicMusicDirectoryService } from './get-music-directory.service';
import { SubsonicMusicFoldersController } from './get-music-folders.controller';
import { SubsonicMusicFoldersService } from './get-music-folders.service';
import { SubsonicNewestPodcastsController } from './get-newest-podcasts.controller';
import { SubsonicNowPlayingController } from './get-now-playing.controller';
import { SubsonicNowPlayingService } from './get-now-playing.service';
import { SubsonicPingController } from './ping.controller';
import { SubsonicPlaylistsController } from './get-playlists.controller';
import { SubsonicPodcastsController } from './get-podcasts.controller';
import { SubsonicRandomSongsController } from './get-random-songs.controller';
import { SubsonicRandomSongsService } from './get-random-songs.service';
import { SubsonicSavePlayQueueController } from './save-play-queue.controller';
import { SubsonicScrobbleController } from './scrobble.controller';
import { SubsonicSearchController } from './search.controller';
import { SubsonicSearchService } from './search.service';
import { SubsonicSimilarSongsController } from './get-similar-songs.controller';
import { SubsonicSimilarSongsService } from './get-similar-songs.service';
import { SubsonicSongController } from './get-song.controller';
import { SubsonicSongService } from './get-song.service';
import { SubsonicSongsByGenreController } from './get-songs-by-genre.controller';
import { SubsonicSongsByGenreService } from './get-songs-by-genre.service';
import { SubsonicStarredController } from './get-starred.controller';
import { SubsonicStarredService } from './get-starred.service';
import { SubsonicStreamController } from './stream.controller';
import { SubsonicTopSongsController } from './get-top-songs.controller';
import { SubsonicTopSongsService } from './get-top-songs.service';

@Module({
  imports: [CoverImagesModule, LibraryModule, StreamingModule],
  controllers: [
    SubsonicAlbumController,
    SubsonicAlbumInfoController,
    SubsonicAlbumListController,
    SubsonicArtistController,
    SubsonicArtistsController,
    SubsonicBookmarksController,
    SubsonicCoverArtController,
    SubsonicGenresController,
    SubsonicIndexesController,
    SubsonicInternetRadioStationsController,
    SubsonicLicenseController,
    SubsonicMusicDirectoryController,
    SubsonicMusicFoldersController,
    SubsonicNewestPodcastsController,
    SubsonicNowPlayingController,
    SubsonicPingController,
    SubsonicPlaylistsController,
    SubsonicPodcastsController,
    SubsonicRandomSongsController,
    SubsonicSavePlayQueueController,
    SubsonicScrobbleController,
    SubsonicSearchController,
    SubsonicSimilarSongsController,
    SubsonicSongController,
    SubsonicSongsByGenreController,
    SubsonicStarredController,
    SubsonicStreamController,
    SubsonicTopSongsController,
  ],
  providers: [
    SubsonicExceptionFilter,
    SubsonicAlbumInfoService,
    SubsonicAlbumListService,
    SubsonicAlbumService,
    SubsonicArtistService,
    SubsonicArtistsService,
    SubsonicGenresService,
    SubsonicIndexesService,
    SubsonicMusicDirectoryService,
    SubsonicMusicFoldersService,
    SubsonicNowPlayingService,
    SubsonicRandomSongsService,
    SubsonicSearchService,
    SubsonicSimilarSongsService,
    SubsonicSongsByGenreService,
    SubsonicSongService,
    SubsonicStarredService,
    SubsonicTopSongsService,
  ],
})
export class SubsonicModule {}
