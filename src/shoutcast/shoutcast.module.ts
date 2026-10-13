import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShoutcastContainerEntity, ShoutcastGenreEntity, ShoutcastStationEntity } from '../database/entities';
import { ShoutcastService } from './shoutcast.service';

@Module({
  imports: [
    LibraryModule,
    SequelizeModule.forFeature([ShoutcastContainerEntity, ShoutcastGenreEntity, ShoutcastStationEntity]),
  ],
  providers: [ShoutcastService],
  exports: [ShoutcastService],
})
export class ShoutcastModule {}
