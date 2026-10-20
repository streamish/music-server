import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { AssociationEntity } from './association.entity';
import { AssociationLinkEntity } from './association-link.entity';
import { FavoriteItemEntity } from './favorite-item.entity';
import { FolderEntity } from './folder.entity';
import { IndexerConfigurationEntity } from './indexer-configuration.entity';
import { PlaylistEntity } from './playlist.entity';
import { PlaylistItemEntity } from './playlist-item.entity';
import { PlaylistSmartRuleEntity } from './playlist-smart-rule.entity';
import { RootPathEntity } from './root-path.entity';
import { SessionEntity } from './session.entity';
import { ShoutcastGenreEntity } from './shoutcast-genre.entity';
import { ShoutcastStationEntity } from './shoutcast-station.entity';
import { SystemConfigurationEntity } from './system-configurations.entity';
import { TrackCustomDataEntity } from './track-custom-data.entity';
import { TrackEntity } from './track.entity';

export {
  AccountEntity,
  AlbumEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  FolderEntity,
  IndexerConfigurationEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  RootPathEntity,
  SessionEntity,
  ShoutcastGenreEntity,
  ShoutcastStationEntity,
  SystemConfigurationEntity,
  TrackCustomDataEntity,
  TrackEntity,
};

// Note:  This array is the list of entities that will be processed by the ORM.  The order of
// this array must respect the foreign key dependencies within the tables i.e. tables referenced
// by foreign keys should appear before tables that reference them.  Getting this wrong will
// prevent the server from starting.
export const entitiesList = [
  AccountEntity,
  SessionEntity,
  IndexerConfigurationEntity,
  SystemConfigurationEntity,
  RootPathEntity,
  AlbumEntity,
  FolderEntity,
  ShoutcastGenreEntity,
  ShoutcastStationEntity,
  TrackEntity,
  TrackCustomDataEntity,
  AssociationEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  FavoriteItemEntity,
  AssociationLinkEntity,
];
