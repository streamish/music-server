import {
  AlbumEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  PlaylistSmartRuleEntity,
  TrackEntity,
} from 'src/database/entities';
import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([AlbumEntity, PlaylistEntity, PlaylistItemEntity, PlaylistSmartRuleEntity, TrackEntity]),
  ],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
