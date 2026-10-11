import { AccountEntity, IndexerConfigurationEntity, RootPathEntity } from 'src/database/entities';
import { ApiIndexerController } from './indexer.controller';
import { ApiIndexerService } from './indexer.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, IndexerConfigurationEntity, RootPathEntity])],
  controllers: [ApiIndexerController],
  providers: [ApiIndexerService],
})
export class ApiIndexerModule {}
