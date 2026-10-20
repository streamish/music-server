import { AccountEntity, AlbumEntity, FolderEntity, RootPathEntity, TrackEntity } from 'src/database/entities';
import { ApiTestController } from './test.controller';
import { ApiTestService } from './test.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, AlbumEntity, FolderEntity, TrackEntity, RootPathEntity])],
  controllers: [ApiTestController],
  providers: [ApiTestService],
})
export class ApiTestModule {}
