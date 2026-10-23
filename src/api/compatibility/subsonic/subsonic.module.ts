import { Module } from '@nestjs/common';
import { SubsonicGetAlbumController } from './get-album.controller';
import { SubsonicGetAlbumList2Controller } from './get-album-list2.controller';
import { SubsonicGetAlbumList2Service } from './get-album-list2.service';
import { SubsonicGetAlbumListController } from './get-album-list.controller';
import { SubsonicGetAlbumListService } from './get-album-list.service';
import { SubsonicGetAlbumService } from './get-album.service';
import { SubsonicGetArtistController } from './get-artist.controller';
import { SubsonicGetArtistService } from './get-artist.service';
import { SubsonicGetArtistsController } from './get-artists.controller';
import { SubsonicGetArtistsService } from './get-artists.service';
import { SubsonicGetIndexesController } from './get-indexes.controller';
import { SubsonicGetIndexesService } from './get-indexes.service';
import { SubsonicGetLicenseController } from './get-license.controller';
import { SubsonicGetMusicDirectoryController } from './get-music-directory.controller';
import { SubsonicGetMusicDirectoryService } from './get-music-directory.service';
import { SubsonicGetMusicFoldersController } from './get-music-folders.controller';
import { SubsonicGetMusicFoldersService } from './get-music-folders.service';
import { SubsonicPingController } from './ping.controller';

@Module({
  controllers: [
    SubsonicGetAlbumListController,
    SubsonicGetAlbumList2Controller,
    SubsonicGetAlbumController,
    SubsonicGetArtistController,
    SubsonicGetArtistsController,
    SubsonicGetIndexesController,
    SubsonicGetLicenseController,
    SubsonicGetMusicDirectoryController,
    SubsonicPingController,
    SubsonicGetMusicFoldersController,
  ],
  providers: [
    SubsonicGetAlbumListService,
    SubsonicGetAlbumList2Service,
    SubsonicGetAlbumService,
    SubsonicGetArtistService,
    SubsonicGetArtistsService,
    SubsonicGetIndexesService,
    SubsonicGetMusicDirectoryService,
    SubsonicGetMusicFoldersService,
  ],
})
export class SubsonicModule {}
