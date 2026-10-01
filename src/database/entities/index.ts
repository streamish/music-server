import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { AssociationEntity } from './association.entity';
import { AssociationLinkEntity } from './association-link.entity';
import { FavoriteItemEntity } from './favorite-item.entity';
import { IndexerConfigurationEntity } from './indexer-configuration.entity';
import { PlaylistEntity } from './playlist.entity';
import { PlaylistItemEntity } from './playlist-item.entity';
import { PlaylistSmartRuleEntity } from './playlist-smart-rule.entity';
import { RootPathEntity } from './root-path.entity';
import { SessionEntity } from './session.entity';
import { ShoutcastContainerEntity } from './shoutcast-container.entity';
import { ShoutcastItemEntity } from './shoutcast-item.entity';
import { SystemConfigurationEntity } from './system-configurations.entity';
import { TrackCustomDataEntity } from './track-custom-data.entity';
import { TrackEntity } from './track.entity';

export {
  AccountEntity,
  AlbumEntity,
  TrackEntity,
  AssociationEntity,
  AssociationLinkEntity,
  FavoriteItemEntity,
  TrackCustomDataEntity,
  IndexerConfigurationEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  RootPathEntity,
  SessionEntity,
  ShoutcastContainerEntity,
  ShoutcastItemEntity,
  SystemConfigurationEntity,
};

export const entitiesList = [
  AccountEntity,
  SessionEntity,
  IndexerConfigurationEntity,
  SystemConfigurationEntity,
  RootPathEntity,
  AlbumEntity,
  TrackEntity,
  TrackCustomDataEntity,
  AssociationEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  FavoriteItemEntity,
  AssociationLinkEntity,
  ShoutcastContainerEntity,
  ShoutcastItemEntity,
];
