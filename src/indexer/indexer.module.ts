import {
  AccountEntity,
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FolderEntity,
  IndexerConfigurationEntity,
  RootPathEntity,
  TrackCustomDataEntity,
  TrackEntity,
} from 'src/database/entities';
import { IndexAlbumService } from './index-album.service';
import { IndexAssociationService } from './index-association.service';
import { IndexFolderService } from './index-folders.service';
import { IndexTrackService } from './index-track.service';
import { IndexerLogService } from './indexer-log.service';
import { IndexerSchedulerService } from './indexer-scheduler.service';
import { IndexerService } from './indexer.service';
import { LibraryScannerService } from './library-scanner.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';
import { TrackSynchronizerService } from './track-synchronizer.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AccountEntity,
      AlbumEntity,
      AssociationEntity,
      AssociationLinkEntity,
      FolderEntity,
      IndexerConfigurationEntity,
      RootPathEntity,
      SystemConfigurationEntity,
      TrackCustomDataEntity,
      TrackEntity,
    ]),
  ],
  providers: [
    IndexerService,
    IndexerSchedulerService,
    IndexAlbumService,
    IndexAssociationService,
    IndexFolderService,
    IndexTrackService,
    IndexerLogService,
    LibraryScannerService,
    TrackSynchronizerService,
  ],
  exports: [IndexerService, IndexerLogService],
})
export class IndexerModule {}
