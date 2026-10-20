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
import { IndexerService } from './indexer.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';

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
  providers: [IndexerService, IndexAlbumService, IndexAssociationService, IndexFolderService, IndexTrackService],
  exports: [IndexerService],
})
export class IndexerModule {}
