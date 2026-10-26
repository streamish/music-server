import { Module } from '@nestjs/common';
import { PlaylistEntity, PlaylistItemEntity, PlaylistSmartRuleEntity } from 'src/database/entities';
import { PlaylistsService } from './playlists.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([PlaylistEntity, PlaylistItemEntity, PlaylistSmartRuleEntity])],
  providers: [PlaylistsService],
  exports: [PlaylistsService],
})
export class PlaylistsModule {}
